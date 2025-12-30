from flask import Blueprint, request, jsonify
import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from .config import token_required
from db.gets import (
    get_teacher_help_config,
    get_active_help_sessions,
    get_help_sessions_for_teacher,
    get_help_queue_for_session,
    get_queue_position,
    is_admin
)
from db.inserts import (
    insert_help_queue_entry,
    insert_help_session
)
from db.alters import (
    update_teacher_help_config,
    update_queue_status
)
from db.deletes import delete_help_session
from supabase_client import supabase

help_bp = Blueprint('help', __name__)

# ========== PUBLIC ENDPOINTS (No auth required) ==========

@help_bp.route('/help-sessions/active', methods=['GET'])
def get_active_sessions():
    """Public: Get currently active help sessions"""
    try:
        sessions = get_active_help_sessions()
        return jsonify({"sessions": sessions}), 200
    except Exception as e:
        logging.exception("Failed to fetch active help sessions")
        return jsonify({"error": str(e)}), 500

@help_bp.route('/help-sessions', methods=['GET'])
def get_all_sessions():
    """Public: Get all upcoming help sessions (recurring + future one-time)"""
    try:
        from db.gets import get_all_uncompleted_help_sessions
        sessions = get_all_uncompleted_help_sessions()
        return jsonify({"sessions": sessions}), 200
    except Exception as e:
        logging.exception("Failed to fetch all help sessions")
        return jsonify({"error": str(e)}), 500

@help_bp.route('/help-queue/join', methods=['POST'])
def join_help_queue():
    """Public: Student joins help queue"""
    data = request.get_json() or {}

    required = ['student_name', 'subject']
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Mangler påkrevde felt"}), 400

    try:
        queue_id, zoom_join_link = insert_help_queue_entry(
            student_name=data['student_name'],
            student_email=data.get('student_email'),
            student_phone=data.get('student_phone'),
            subject=data['subject'],
            description=data.get('description'),
            preferred_teacher_id=data.get('preferred_teacher_id')
        )
        return jsonify({
            "message": "Du er nå i køen!",
            "queue_id": queue_id,
            "zoom_join_link": zoom_join_link
        }), 201
    except ValueError as e:
        print("error joining help queue:", e)
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logging.exception("Failed to join help queue")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/help-queue/position/<queue_id>', methods=['GET'])
def get_position(queue_id):
    """Public: Get position in queue"""
    try:
        position_data = get_queue_position(queue_id)
        if not position_data:
            return jsonify({"error": "Køoppføring ikke funnet"}), 404

        return jsonify({"position": position_data}), 200
    except Exception as e:
        logging.exception(f"Failed to fetch queue position for {queue_id}")
        return jsonify({"error": str(e)}), 500


# ========== TEACHER ENDPOINTS ==========

@help_bp.route('/teacher/help-config', methods=['GET'])
@token_required
def get_teacher_config(user_id):
    """Teacher: Get their help config"""
    try:
        config = get_teacher_help_config(user_id)
        return jsonify({"config": config}), 200
    except Exception as e:
        logging.exception(f"Failed to fetch help config for {user_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/help-config', methods=['PUT'])
@token_required
def update_teacher_config(user_id):
    """Teacher: Update Zoom link and availability"""
    data = request.get_json() or {}

    try:
        update_teacher_help_config(
            teacher_user_id=user_id,
            zoom_link=data.get('zoom_link'),
            available_for_help=data.get('available_for_help')
        )
        return jsonify({"message": "Konfigurasjonen er oppdatert"}), 200
    except Exception as e:
        logging.exception(f"Failed to update help config for {user_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/my-sessions', methods=['GET'])
@token_required
def get_my_sessions(user_id):
    """Teacher: Get their help sessions"""
    try:
        sessions = get_help_sessions_for_teacher(user_id)
        return jsonify({"sessions": sessions}), 200
    except Exception as e:
        logging.exception(f"Failed to fetch sessions for {user_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/my-sessions', methods=['POST'])
@token_required
def create_my_session(user_id):
    """Teacher: Create new help session (self-assign) - recurring or one-time"""
    data = request.get_json() or {}

    required = ['start_time', 'end_time', 'recurring']
    if not all(field in data for field in required):
        return jsonify({"error": "Mangler påkrevde felt (start_time, end_time, recurring)"}), 400

    recurring = data['recurring']
    print("data:", data)
    # Validate based on session type
    if recurring and 'day_of_week' not in data:
        return jsonify({"error": "day_of_week er påkrevd for tilbakevendende økter"}), 400
    if not recurring and 'session_date' not in data:
        return jsonify({"error": "session_date er påkrevd for engangsøkter"}), 400

    try:
        session_id = insert_help_session(
            teacher_user_id=user_id,
            start_time=data['start_time'],
            end_time=data['end_time'],
            created_by_user_id=user_id,
            recurring=recurring,
            day_of_week=data.get('day_of_week'),
            session_date=data.get('session_date')
        )
        return jsonify({
            "message": "Økten er opprettet",
            "session_id": session_id
        }), 201
    except Exception as e:
        logging.exception(f"Failed to create session for {user_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/queue', methods=['GET'])
@token_required
def get_teacher_queue(user_id):
    """Teacher: Get queue for their active session (recurring and one-time)"""

    OSLO_TZ = ZoneInfo("Europe/Oslo")

    active_sessions = []
    now_oslo = datetime.now(OSLO_TZ)  # Current time in Oslo
    now_utc = datetime.now(timezone.utc)  # For non-recurring comparison
    try:
        sessions = get_help_sessions_for_teacher(user_id)
        print("sessions:", sessions)
        for session in sessions:
            start_dt = datetime.fromisoformat(session["start_time"])
            end_dt = datetime.fromisoformat(session["end_time"])


            if start_dt <= now_utc <= end_dt and not session["recurring"]:
                # One-time session: compare in UTC (correct)
                active_sessions.append(session)

            elif session["recurring"]:
                # Recurring session: compare in Oslo time
                day_of_week = session["day_of_week"]  # 0,1,2,3,4,5,6
                #get the hour/minute from start_time/end_time
                start_time_only = start_dt.time()
                end_time_only = end_dt.time()

                # Check if today (in Oslo) is the correct day of the week
                if now_oslo.weekday() == day_of_week:
                    # Create datetime for today in Oslo timezone with session times
                    start_dt_recurring = datetime.combine(now_oslo.date(), start_time_only, tzinfo=OSLO_TZ)
                    end_dt_recurring = datetime.combine(now_oslo.date(), end_time_only, tzinfo=OSLO_TZ)

                    if start_dt_recurring <= now_oslo <= end_dt_recurring:
                        active_sessions.append(session)


        if len(active_sessions) == 0:
            return jsonify({"queues": []}), 200
        
        #order them by start time
        active_sessions.sort(
            key=lambda x: datetime.fromisoformat(x["start_time"])
        )       
        queues = [] #will always have only one element, but keeping as list for future proofing

        for active_session in active_sessions:
            queue = get_help_queue_for_session(active_session['session_id'])
            queues.append({
                "session_id": active_session['session_id'],
                "queue": queue
            })
        return jsonify({"queues": queues}), 200
    except Exception as e:
        logging.exception(f"Failed to fetch queue for {user_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/queue/<queue_id>/admit', methods=['POST'])
@token_required
def admit_student(user_id, queue_id):
    """Teacher: Admit student from queue"""
    try:
        update_queue_status(queue_id, 'admitted')
        return jsonify({"message": "Student sluppet inn"}), 200
    except Exception as e:
        logging.exception(f"Failed to admit student {queue_id}")
        return jsonify({"error": str(e)}), 500
    
@help_bp.route('/teacher/queue/<queue_id>', methods=['DELETE'])
def student_leaves_queue(queue_id):
    """Student: Leave the help queue"""
    try:
        update_queue_status(queue_id, 'no_show')
        return jsonify({"message": "Du har forlatt køen"}), 200
    except Exception as e:
        logging.exception(f"Failed to leave queue {queue_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/queue/<queue_id>/complete', methods=['POST'])
@token_required
def complete_student(user_id, queue_id):
    """Teacher: Mark student as completed"""
    try:
        update_queue_status(queue_id, 'completed')
        return jsonify({"message": "Student fullført"}), 200
    except Exception as e:
        logging.exception(f"Failed to complete student {queue_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/queue/<queue_id>/no-show', methods=['POST'])
@token_required
def mark_no_show(user_id, queue_id):
    """Teacher: Mark student as no-show"""
    try:
        update_queue_status(queue_id, 'no_show')
        return jsonify({"message": "Student markert som ikke møtt"}), 200
    except Exception as e:
        logging.exception(f"Failed to mark no-show {queue_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/my-sessions/<session_id>', methods=['DELETE'])
@token_required
def delete_my_session(user_id, session_id):
    """Teacher: Delete own session"""
    try:
        delete_help_session(session_id, user_id)
        return jsonify({"message": "Økten er slettet"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logging.exception(f"Failed to delete session {session_id}")
        return jsonify({"error": str(e)}), 500


# ========== ADMIN ENDPOINTS ==========


@help_bp.route('/admin/help-sessions', methods=['GET'])
@token_required
def admin_get_all_sessions(user_id):
    """Admin: Get all help sessions"""
    if not is_admin(user_id):
        return jsonify({"error": "Ikke autorisert"}), 403
    

    now_utc = datetime.now(timezone.utc)

    try:
        # Get all sessions across all teachers
        response = (
            supabase
            .table('help_sessions')
            .select('*, teachers!fk_help_session_teacher(firstname, lastname)')
            .eq('is_active', True)
            .gte('end_time', now_utc.isoformat())
            .execute()
        )
        return jsonify({"sessions": response.data}), 200
    except Exception as e:
        logging.exception("Admin failed to fetch all sessions")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/admin/help-sessions/<session_id>', methods=['DELETE'])
@token_required
def admin_delete_session(user_id, session_id):
    """Admin: Delete any session"""
    if not is_admin(user_id):
        return jsonify({"error": "Ikke autorisert"}), 403

    try:
        delete_help_session(session_id, user_id)
        return jsonify({"message": "Økten er slettet"}), 200
    except Exception as e:
        logging.exception(f"Admin failed to delete session {session_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/admin/teacher/<teacher_user_id>/toggle-availability', methods=['POST'])
@token_required
def admin_toggle_availability(user_id, teacher_user_id):
    """Admin: Toggle teacher's availability"""
    if not is_admin(user_id):
        return jsonify({"error": "Ikke autorisert"}), 403

    data = request.get_json() or {}
    if 'available_for_help' not in data:
        return jsonify({"error": "Mangler available_for_help felt"}), 400

    try:
        update_teacher_help_config(
            teacher_user_id=teacher_user_id,
            available_for_help=data['available_for_help']
        )
        return jsonify({"message": "Tilgjengelighet oppdatert"}), 200
    except Exception as e:
        logging.exception(f"Admin failed to toggle availability for {teacher_user_id}")
        return jsonify({"error": str(e)}), 500
    

@help_bp.route('/admin/teachers/availability', methods=['GET'])
@token_required
def admin_get_teachers_availability(user_id):
    """Admin: Get all teachers' help availability"""
    if not is_admin(user_id):
        return jsonify({"error": "Ikke autorisert"}), 403

    try:
        response = (
            supabase
            .table('teachers')
            .select("""
                user_id,
                firstname,
                lastname,
                teacher_help_config (
                    available_for_help,
                    zoom_link,
                    updated_at
                )
            """)
            .execute()
        )
        print("response:", response)
        return jsonify({"teachers_availability": response.data}), 200
    except Exception as e:
        logging.exception("Admin failed to fetch teachers' availability")
        return jsonify({"error": str(e)}), 500

from flask import Blueprint, request, jsonify
import logging

from .config import token_required
from db.gets import (
    get_teacher_help_config,
    get_all_available_teachers,
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
            zoom_host_link=data.get('zoom_host_link'),
            zoom_join_link=data.get('zoom_join_link'),
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
    """Teacher: Create new help session (self-assign)"""
    data = request.get_json() or {}

    required = ['day_of_week', 'start_time', 'end_time']
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Mangler påkrevde felt"}), 400

    try:
        session_id = insert_help_session(
            teacher_user_id=user_id,
            day_of_week=data['day_of_week'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            created_by_user_id=user_id
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
    """Teacher: Get queue for their active session"""
    try:
        # Find teacher's active session
        from datetime import datetime
        sessions = get_help_sessions_for_teacher(user_id)

        # Get current active session (matching day/time)
        current_day = datetime.now().weekday()
        current_time = datetime.now().time()

        active_session = None
        for session in sessions:
            # Parse time strings to compare
            from datetime import time as dt_time
            start_parts = session['start_time'].split(':')
            end_parts = session['end_time'].split(':')
            start_time = dt_time(int(start_parts[0]), int(start_parts[1]))
            end_time = dt_time(int(end_parts[0]), int(end_parts[1]))

            if (session['day_of_week'] == current_day and
                start_time <= current_time < end_time):
                active_session = session
                break

        if not active_session:
            return jsonify({"queue": []}), 200

        queue = get_help_queue_for_session(active_session['session_id'])
        return jsonify({"queue": queue}), 200
    except Exception as e:
        logging.exception(f"Failed to fetch queue for {user_id}")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/teacher/queue/<queue_id>/admit', methods=['POST'])
@token_required
def admit_student(user_id, queue_id):
    """Teacher: Admit student from queue"""
    try:
        update_queue_status(queue_id, 'admitted')
        return jsonify({"message": "Student innrømmet"}), 200
    except Exception as e:
        logging.exception(f"Failed to admit student {queue_id}")
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

@help_bp.route('/admin/help-sessions', methods=['POST'])
@token_required
def admin_create_session(user_id):
    """Admin: Create session for any teacher"""
    if not is_admin(user_id):
        return jsonify({"error": "Ikke autorisert"}), 403

    data = request.get_json() or {}
    required = ['teacher_user_id', 'day_of_week', 'start_time', 'end_time']
    if not all(data.get(f) for f in required):
        return jsonify({"error": "Mangler påkrevde felt"}), 400

    try:
        session_id = insert_help_session(
            teacher_user_id=data['teacher_user_id'],
            day_of_week=data['day_of_week'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            created_by_user_id=user_id  # Admin's user_id
        )
        return jsonify({
            "message": "Økten er opprettet",
            "session_id": session_id
        }), 201
    except Exception as e:
        logging.exception("Admin failed to create session")
        return jsonify({"error": str(e)}), 500


@help_bp.route('/admin/help-sessions', methods=['GET'])
@token_required
def admin_get_all_sessions(user_id):
    """Admin: Get all help sessions"""
    if not is_admin(user_id):
        return jsonify({"error": "Ikke autorisert"}), 403

    try:
        # Get all sessions across all teachers
        response = supabase.table('help_sessions').select('*, teachers(firstname, lastname)').eq('is_active', True).execute()
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

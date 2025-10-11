from flask import Blueprint, request, jsonify
import logging

from .config import token_required
from cloud_sql.gets import (
    get_teacher_by_user_id,
    get_teacher_for_student,
    get_all_teachers,
    get_all_teachers_join_students
)
from cloud_sql.alters import (
    toggle_want_more_students,
    update_teacher_profile
)

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/get-teacher', methods=['GET'])
@token_required
def get_current_teacher(user_id):
    logging.info(f"Fetching teacher data for user_id: {user_id}")
    if not user_id:
        return jsonify({"error": "User id not found"}), 401

    teacher_data = get_teacher_by_user_id(user_id)
    if not teacher_data:
        return jsonify({"error": "Teacher not found."}), 404

    return jsonify({"teacher": teacher_data[0]}), 200


@teacher_bp.route('/get-teacher-for-student', methods=["GET"])
@token_required
def get_teacher_for_student_route(user_id):
    try:
        teachers = get_teacher_for_student(user_id)
        return jsonify({"teachers": teachers}), 200
    except Exception as e:
        logging.exception("Failed to fetch teacher for student")
        return jsonify({"message": str(e)}), 500


@teacher_bp.route('/get-all-teachers', methods=["GET"])
def get_all_teachers_route():
    try:
        teachers = get_all_teachers()
        return jsonify({"teachers": teachers}), 200
    except Exception as e:
        logging.exception("Failed to fetch all teachers")
        return jsonify({"message": str(e)}), 500
    
from cloud_sql.gets import get_all_teachers_inc_resigned
@teacher_bp.route('/get-all-teachers-inc-resigned', methods=["GET"])
def get_all_teachers_inc_resigned_route():
    try:
        teachers = get_all_teachers_inc_resigned()
        return jsonify({"teachers": teachers}), 200
    except Exception as e:
        logging.exception("Failed to fetch all teachers including resigned")
        return jsonify({"message": str(e)}), 500

@teacher_bp.route('/get-all-teachers-join-students', methods=["GET"])
def get_all_teachers_join_students_route():
    try:
        data = get_all_teachers_join_students()
        return jsonify({"teachersJoinStudents": data}), 200
    except Exception as e:
        logging.exception("Failed to fetch teachers with students")
        return jsonify({"message": str(e)}), 500



@teacher_bp.route('/toggle-wants-more-students', methods=["POST"])
@token_required
def toggle_want_more_students_route(user_id):
    data = request.get_json() or {}
    physical = data.get('physical')
    digital = data.get('digital')
    if physical is None or digital is None:
        print("Missing physical or digital flags")
        print("Received data:", data)
        return jsonify({"message": "Missing physical or digital flags"}), 400
    try:
        toggle_want_more_students( physical, digital, user_id)
        return jsonify({"message": "Settings updated"}), 200
    except Exception as e:
        logging.exception("Failed to toggle wants-more-students")
        return jsonify({"message": str(e)}), 500


@teacher_bp.route('/update-teacher-profile', methods=["POST"])
@token_required
def update_teacher_profile_route(user_id):
    data = request.get_json() or {}
    required = ['firstname','lastname','phone','address','postal_code']
    if not all(data.get(f) for f in required):
        return jsonify({"message": "Missing required fields"}), 400
    try:
        update_teacher_profile(
            teacher_user_id=user_id,
            firstname=data['firstname'],
            lastname=data['lastname'],
            phone=data['phone'],
            address=data['address'],
            postal_code=data['postal_code'],
            additional_comments=data.get('additional_comments'),
            location=data.get('location'),
            physical=data.get('physical_tutouring'),
            digital=data.get('digital_tutouring')
        )
        return jsonify({"message": "Profile updated"}), 200
    except Exception as e:
        logging.exception("Failed to update teacher profile")
        return jsonify({"message": str(e)}), 500


from cloud_sql.alters import update_teacher_notes
@teacher_bp.route('/upload-notes-about-teacher', methods=["POST"])
@token_required
def upload_notes_about_teacher_route(user_id):
    data = request.json or {}
    teacher_user_id = data.get('teacher_user_id')
    notes = data.get('notes', '')
    if not teacher_user_id:
        return jsonify({"message": "Missing teacher_user_id"}), 400
    try:
        update_teacher_notes(user_id, teacher_user_id, notes)
        return jsonify({"message": "Notes updated"}), 200
    except Exception as e:
        logging.exception(f"Failed to upload notes about teacher {teacher_user_id}: {e}")
        return jsonify({"message": str(e)}), 500
    

from cloud_sql.gets import get_teachers_without_about_me
from server_routes.email import sendEmailsToAddAboutMeText
@teacher_bp.route('/send-email-to-teachers-without-about-me', methods=["GET"])
def send_email_to_teachers_without_about_me_route():
    try:
        teachers = get_teachers_without_about_me()
    except Exception as e:
        logging.exception("Failed to fetch teachers without 'about me'")
        return jsonify({"message": str(e)}), 500
    
    try:
        sendEmailsToAddAboutMeText(teachers)
        return jsonify({"message": "Emails sent successfully"}), 200
    except Exception as e:
        logging.exception("Failed to send emails to teachers without 'about me'")
        return jsonify({"message": str(e)}), 500
    

from cloud_sql.gets import get_teachers_without_quizes
from server_routes.email import sendEmailsToTeacherAboutTakingQuiz
@teacher_bp.route('/send-email-to-teachers-without-quizes', methods=["GET"])
def send_email_to_teachers_without_quizes_route():
    try:
        teachers = get_teachers_without_quizes()
    except Exception as e:
        logging.exception("Failed to fetch teachers without quizzes")
        return jsonify({"message": str(e)}), 500
    
    try:
        sendEmailsToTeacherAboutTakingQuiz(teachers)
        return jsonify({"message": "Emails sent successfully"}), 200
    except Exception as e:
        logging.exception("Failed to send emails to teachers about quizzes")
        return jsonify({"message": str(e)}), 500
    

from cloud_sql.alters import retireTeacher
@teacher_bp.route('/retire-teacher', methods=["POST"])
@token_required
def retire_teacher_route(user_id):
    data = request.get_json() or {}
    teacher_user_id = data.get('teacher_user_id')
    admin_user_id = user_id

    if not teacher_user_id:
        return jsonify({"message": "Missing teacher_user_id"}), 400
    if not admin_user_id:
        return jsonify({"message": "Missing admin_user_id"}), 400

    try:
        retireTeacher(teacher_user_id, admin_user_id)
        return jsonify({"message": "Teacher retired successfully"}), 200
    except Exception as e:
        logging.exception(f"Failed to retire teacher {teacher_user_id}: {e}")
        return jsonify({"message": str(e)}), 500
    

from cloud_sql.alters import reactivateTeacher
@teacher_bp.route('/reactivate-teacher', methods=["POST"])
@token_required
def reactivate_teacher_route(user_id):
    data = request.get_json() or {}
    teacher_user_id = data.get('teacher_user_id')
    admin_user_id = user_id

    if not teacher_user_id:
        return jsonify({"message": "Missing teacher_user_id"}), 400

    try:
        reactivateTeacher(teacher_user_id, admin_user_id)
        return jsonify({"message": "Teacher reactivated successfully"}), 200
    except Exception as e:
        logging.exception(f"Failed to reactivate teacher {teacher_user_id}: {e}")
        return jsonify({"message": str(e)}), 500
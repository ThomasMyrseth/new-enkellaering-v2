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
        return jsonify({"message": "Missing physical or digital flags"}), 400
    try:
        toggle_want_more_students(user_id, physical, digital)
        return jsonify({"message": "Settings updated"}), 200
    except Exception as e:
        logging.exception("Failed to toggle wants-more-students")
        return jsonify({"message": str(e)}), 500


@teacher_bp.route('/update-teacher-profile', methods=["POST"])
@token_required
def update_teacher_profile_route(user_id):
    data = request.get_json() or {}
    required = ['firstname','lastname','email','phone','address','postal_code']
    if not all(data.get(f) for f in required):
        return jsonify({"message": "Missing required fields"}), 400
    try:
        update_teacher_profile(
            teacher_user_id=user_id,
            firstname=data['firstname'],
            lastname=data['lastname'],
            email=data['email'],
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

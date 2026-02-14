from flask import Blueprint, request, jsonify

from .config import token_required
from db.gets import (
    get_student_for_teacher,
    get_student_by_user_id,
    get_all_students,
    get_students_without_teacher
)
from db.alters import (
    set_student_to_inactive,
    set_student_to_active,
    update_student_notes
)

student_bp = Blueprint('student', __name__)


@student_bp.route('/get-students', methods=["GET"])
@token_required
def get_students(user_id):
    try:
        students = get_student_for_teacher(user_id)
        return jsonify({"students": students}), 200
    except Exception as e:
        print("error: ", e)
        return jsonify({"message": str(e)}), 500


@student_bp.route('/get-student', methods=["GET"])
@token_required
def get_student(user_id):
    try:
        students = get_student_by_user_id(user_id)
        if not students:
            return jsonify({"message": "Student not found"}), 404
        return jsonify({"student": students[0]}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@student_bp.route('/get-all-students', methods=["GET"])
@token_required
def get_all_students_route(user_id):
    try:
        students = get_all_students(user_id)
        return jsonify({"students": students}), 200
    except Exception as e:
        print("error getting all students:", e)
        return jsonify({"message": str(e)}), 500


@student_bp.route('/set-student-to-inactive', methods=["POST"])
@token_required
def set_student_to_inactive_route(user_id):
    student_user_id = request.json.get('student_user_id')
    if not student_user_id:
        return jsonify({"message": "Missing student_user_id"}), 400
    try:
        set_student_to_inactive(student_user_id, user_id)
        return jsonify({"message": "Student set to inactive"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@student_bp.route('/set-student-to-active', methods=["POST"])
@token_required
def set_student_to_active_route(user_id):
    student_user_id = request.json.get('student_user_id')
    if not student_user_id:
        return jsonify({"message": "Missing student_user_id"}), 400
    try:
        set_student_to_active(student_user_id, user_id)
        return jsonify({"message": "Student set to active"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@student_bp.route('/upload-notes-about-student', methods=["POST"])
@token_required
def upload_notes_about_student_route(user_id):
    data = request.json or {}
    student_user_id = data.get('student_user_id')
    notes = data.get('notes', '')
    if not student_user_id:
        return jsonify({"message": "Missing student_user_id"}), 400
    try:
        update_student_notes(user_id, student_user_id, notes)
        return jsonify({"message": "Notes updated"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@student_bp.route('/get-student-without-teacher', methods=["GET"])
@token_required
def get_student_without_teacher_route(user_id):
    try:
        students = get_students_without_teacher()
        return jsonify({"students": students}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

from flask import Blueprint, request, jsonify
import os

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


student_bp = Blueprint('student', __name__)


from big_query.gets import get_student_for_teacher
@student_bp.route('/get-students', methods=["GET"])
@token_required
def get_students(user_id):

    if not user_id:
        return jsonify({"message": "missing user id"})
    
    students = get_student_for_teacher(client=bq_client, teacher_user_id=user_id)
    students_data = [dict(row) for row in students]  # Assuming multiple rows, adjust as needed

    return jsonify({
        "students" : students_data
    }), 200


from big_query.gets import get_student_by_user_id
@student_bp.route('/get-student', methods=["GET"])
@token_required
def get_student(user_id):

    res = get_student_by_user_id(client=bq_client, user_id=user_id)

    if not res or res.errors:
        return jsonify({"message": "failed to fetch student"}), 400
    
    students = [dict(row) for row in res]  # Assuming multiple rows, adjust as needed

    return {
        "student": students[0]
    }, 200


from big_query.gets import get_all_students
@student_bp.route('/get-all-students', methods=["GET"])
@token_required
def get_all_students_route(user_id):
    admin_user_id = user_id

    if not admin_user_id:
        print("missing admin user id")
        return jsonify({"message": "Missing admin user id"}), 400
    
    res = get_all_students(client=bq_client, admin_user_id=admin_user_id)

    if not res or res.errors:
        print("Error fetching students", res.errors)
        return jsonify({"message": "Error fetching students"}), 500
    
    result = res.result()
    print(res.result())
    students = [dict(row) for row in result]

    if len(students)==0:
        return jsonify({
            "students": []
        }), 200
    
    return jsonify({
        "students": students
    }), 200


    
from big_query.alters import setStudentToInactive
@student_bp.route('/set-student-to-inactive', methods=["POST"])
@token_required
def set_student_to_inactive_route(user_id):
    data = request.get_json()
    student_user_id = data.get('student_user_id')

    res = setStudentToInactive(client=bq_client, admin_user_id=user_id, student_user_id=student_user_id)

    if not res or res.errors:
        print("Error setting student to inactive", res.errors)
        return jsonify({"message": "failed to set student to inactive"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully set student to inactive"}), 200


from big_query.alters import setStudentToActive
@student_bp.route('/set-student-to-active', methods=["POST"])
@token_required
def set_student_to_active_route(user_id):
    data = request.get_json()
    student_user_id = data.get('student_user_id')

    res = setStudentToActive(client=bq_client, admin_user_id=user_id, student_user_id=student_user_id)

    if not res or res.errors:
        print("Error setting student to active", res.errors)
        return jsonify({"message": "failed to set student to active"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully set student to active"}), 200




from big_query.alters import updateStudentNotes
@student_bp.route('/upload-notes-about-student', methods=["POST"])
@token_required
def upload_notes_about_student_route(user_id):
    data = request.get_json()
    student_user_id = data.get('student_user_id')
    notes = data.get('notes')

    res = updateStudentNotes(admin_user_id=user_id, student_user_id=student_user_id, notes=notes, client=bq_client)

    if not res or res.errors:
        print("Error adding notes about student", res.errors)
        return jsonify({"message": "failed to add notes about student"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully added notes about student"}), 200


from big_query.gets import get_students_without_teacher
@student_bp.route('/get-student-without-teacher', methods=["GET"])
@token_required

def get_student_without_teacher_route(user_id):
    if not user_id:
        return jsonify({"message": "missing user id"})
    
    try:
        students = get_students_without_teacher(client=bq_client)
        return jsonify({"students": students}), 200
    except Exception as e:
        print("Error fetching students without teacher", e)
        return jsonify({"message": f"failed to fetch students without teacher: {e}"}), 500
    
    
    

    


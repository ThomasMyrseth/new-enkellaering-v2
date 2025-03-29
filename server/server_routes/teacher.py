from flask import Blueprint, request, jsonify
import os
import logging

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


teacher_bp = Blueprint('teacher', __name__)

from big_query.gets import get_teacher_by_user_id
@teacher_bp.route('/get-teacher', methods=['GET'])
@token_required
def get_current_teacher(user_id):
    logging.info(f"Fetching teacher data for user_id: {user_id}")
    print(f"fetching teacher for {user_id}")
    if not user_id:
        return jsonify({"error": "User id not found"}), 401  # Unauthorized

    # Fetch teacher data
    teacher = get_teacher_by_user_id(client=bq_client, user_id=user_id)

    if not teacher:
        return jsonify({"error": "Teacher not found."}), 404

    # Convert RowIterator to a serializable dictionary
    teacher_data = [dict(row) for row in teacher]  # Assuming multiple rows, adjust as needed

    if len(teacher_data) == 0:
        return jsonify({"error": "Teacher not found."}), 404

    # If there's only one teacher, return the first one
    return jsonify({"teacher": teacher_data[0]}), 200


from big_query.gets import get_teacher_for_student
@teacher_bp.route('/get-teacher-for-student', methods=["GET"])
@token_required
def get_teacher_for_student_route(user_id):

    res = get_teacher_for_student(client=bq_client, student_user_id=user_id)

    if not res or res.errors:
        print(res.errors)
        return jsonify({"message": "failed to fetch teacher"}), 400
    
    data = res.result()
    teacher_data = [dict(row) for row in data]  # Assuming multiple rows, adjust as needed

    print("teacher data:",teacher_data)
    if len(teacher_data)==0:
        return jsonify({
            "teachers": []
        }), 200

    return jsonify({
        "teachers": teacher_data
    }), 200


from big_query.gets import get_all_teachers
@teacher_bp.route('/get-all-teachers', methods=["GET"])
def get_all_teachers_route():
    
    res = get_all_teachers(client=bq_client)

    if not res or res.errors:
        print("Error fetching teachers")
        return jsonify({"message": "Error fetching teachers"}), 500
    
    result = res.result()
    teachers = [dict(row) for row in result]

    if len(teachers)==0:
        return jsonify({
            "teachers": []
        }), 200
    
    return jsonify({
        "teachers": teachers
    }), 200



from big_query.alters import toggleWantMoreStudents
@teacher_bp.route('/toggle-wants-more-students', methods=["POST"])
@token_required
def toggle_want_more_students_route(user_id):
    data = request.get_json()
    physical = data.get('physical')
    digital = data.get('digital')

    res = toggleWantMoreStudents(client=bq_client, physical=physical, digital=digital, teacher_user_id=user_id)

    if not res or res.errors:
        print("Error setting student to active", res.errors)
        return jsonify({"message": "failed to set student to active"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully set student to active"}), 200


from big_query.alters import update_teacher_profile
@teacher_bp.route('/update-teacher-profile', methods=["POST"])
@token_required
def update_teacher_profile_route(user_id):
    teacher_user_id = user_id

    if not teacher_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json()
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    phone = data.get('phone')
    address = data.get('address')
    postal_code = data.get('postal_code')
    additional_comments = data.get('additional_comments')
    location = data.get('location')
    physical = data.get('physical_tutouring')
    digital = data.get('digital_tutouring')

    if not (firstname and lastname and email and phone and address and postal_code):
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        res = update_teacher_profile(client=bq_client, teacher_user_id=teacher_user_id, firstname=firstname, lastname=lastname, email=email, phone=phone, address=address, postal_code=postal_code, additional_comments=additional_comments, location=location, physical=physical, digital=digital)
        if res:
            return jsonify({"message": "Updated new order"}), 200
        
        raise(Exception("Error updating new order"))
    
    except Exception as e:
        print(f"error updating new order {e}")
        return jsonify({"message": f"Error updating new order {e}"}), 500

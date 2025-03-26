from flask import Blueprint, request, jsonify
from datetime import datetime
import os

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


classes_bp = Blueprint('classes', __name__)

from big_query.gets import get_classes_for_student
@classes_bp.route('/get-classes-for-student', methods=["GET"])
@token_required
def get_classes_for_student_route(user_id):

    res = get_classes_for_student(client=bq_client, student_user_id=user_id)

    if not res or res.errors:
        return jsonify({
            "message": f"An error happened while fetching classes: {res.errors}"
        }), 500
    
    data = res.result()
    classes = [dict(row) for row in data] 

    if len(classes)==0:
        return jsonify({
            "classes": []
        }), 200

    return jsonify({
        "classes": classes
    }), 200



from big_query.gets import get_classes_for_teacher
@classes_bp.route('/get-classes-for-teacher', methods=["GET"])
@token_required
def get_classes_for_teacher_route(user_id):

    res = get_classes_for_teacher(client=bq_client, teacher_user_id=user_id)

    if not res or res.errors:
        return jsonify({
            "message": f"An error happened while fetching classes: {res.errors}"
        }), 500
    
    data = res.result()
    classes = [dict(row) for row in data] 

    if len(classes)==0:
        return jsonify({
            "classes": []
        }), 200

    return jsonify({
        "classes": classes
    }), 200


from big_query.gets import get_all_classes
@classes_bp.route('/get-all-classes', methods=["GET"])
@token_required
def get_all_classes_route(user_id):
    admin_user_id = user_id

    res = get_all_classes(client=bq_client, admin_user_id=admin_user_id)

    if not res or res.errors:
        print(f"Error fetching classes for admin {res.errors}")
        return jsonify({
            "message": "Error while fetching admin classes"
        }), 400
    
    result = res.result()
    classes = [dict(row) for row in result]

    if len(classes)==0:
        return jsonify({
            "classes": []
        }), 200
    
    return jsonify({
        "classes": classes
    }), 200


from big_query.alters import setClassesToInvoiced
@classes_bp.route('/set-classes-to-invoiced', methods=["POST"])
@token_required
def set_classes_to_invoiced_route(user_id):
    admin_user_id = user_id
    data = request.get_json()
    class_ids = data.get('class_ids')

    if not admin_user_id or not class_ids:
        print("missing class ids or user id")
        return jsonify({"message": "missing class ids or user ids"}), 401
    
    if len(class_ids)==0:
        print("class ids was an empty list")
        return jsonify({"message": "class ids was an emtpy list"}), 400
    
    res = setClassesToInvoiced(client=bq_client, admin_user_id=admin_user_id, class_ids=class_ids)

    if not res or res.errors:
        print("Error setting classes to invoiced", res.errors)
        return jsonify({"message": "failed to set classes to invoiced"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully set classes to invoiced"}), 200


from big_query.alters import setClassesToPaid
@classes_bp.route('/set-classes-to-paid', methods=["POST"])
@token_required
def set_classes_to_paid_route(user_id):
    admin_user_id = user_id
    data = request.get_json()
    class_ids = data.get('class_ids')

    if not admin_user_id or not class_ids:
        print("missing class ids or user id")
        return jsonify({"message": "missing class ids or user ids"}), 401
    
    if len(class_ids)==0:
        print("class ids was an empty list")
        return jsonify({"message": "class ids was an emtpy list"}), 400
    
    res = setClassesToPaid(client=bq_client, admin_user_id=admin_user_id, class_ids=class_ids)

    if not res or res.errors:
        print("Error setting classes to paid", res.errors)
        return jsonify({"message": "failed to set classes to paid"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully set classes to paid"}), 200
   

from big_query.gets import get_classes_by_teacher
@classes_bp.route('/fetch-classes-for-teacher', methods=["GET"])
@token_required
def fetch_classes_for_teacher(user_id):

    if not user_id:
        print("user id not found")
        raise Exception("user id not found")


    classes = get_classes_by_teacher(client=bq_client, user_id=user_id)
    
    classes_data = [dict(row) for row in classes]  # Assuming multiple rows, adjust as needed
    if len(classes_data)==0:
        return jsonify({"classes": []}), 200


    return jsonify({
        "classes": classes_data
    }), 200


from big_query.bq_types import Classes
import uuid
from big_query.inserts import insert_class
@classes_bp.route('/upload-new-class', methods=["POST"])
@token_required
def upload_new_class(user_id):
    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    student_user_id = data.get('student_user_id')
    started_at = data.get("started_at")
    ended_at = data.get("ended_at")
    comment = data.get("comment")
    was_canselled = data.get("was_canselled") or False
    invoiced_student = False
    paid_teacher = False
    paid_teacher_at = None
    invoiced_student_at = None

    if not(teacher_user_id and student_user_id and started_at and ended_at):
        return jsonify({"message": "Missing required fields"}), 400
    
    new_class = Classes(
        class_id=str(uuid.uuid4()),
        teacher_user_id=teacher_user_id,
        student_user_id=student_user_id,
        created_at=datetime.now().isoformat(),
        started_at=started_at,
        ended_at=ended_at,
        comment=comment,
        paid_teacher=paid_teacher,
        invoiced_student=invoiced_student,
        paid_teacher_at=paid_teacher_at,
        invoiced_student_at=invoiced_student_at,
        was_canselled=was_canselled
    )

    try:
        response = insert_class(client=bq_client, class_obj=new_class)
        if response:
            print("inserted new class successfully")
            return jsonify({"message": "Class inserted successfully"}), 200
    except Exception as e:
        print(f"error {e}")
        return jsonify({"message": f"Error inserting new class {e}"}), 500


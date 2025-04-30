
from flask import Blueprint, jsonify
import os

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


admin_bp = Blueprint('admin', __name__)


from big_query.gets import is_user_admin

@admin_bp.route('/is-admin', methods=["GET"])
@token_required
def is_admin_route(user_id):
    res = is_user_admin(client=bq_client, user_id=user_id)
    return jsonify({"is_admin": res}), 200 # true or false



@admin_bp.route('/update-travel-pay', methods=["POST"])
@token_required
def update_travel_payment_route(user_id):
    """
    Update travel payment for a user
    """
    from big_query.alters import update_travel_payment
    from flask import request

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    admin_user_id = user_id
    travel_payment_to_teacher = data.get('travel_pay_to_teacher')
    travel_payment_from_student = data.get('travel_pay_from_student')
    student_user_id = data.get('student_user_id')
    teacher_user_id = data.get('teacher_user_id')

    if not travel_payment_to_teacher or not travel_payment_from_student or not student_user_id or not teacher_user_id:
        return jsonify({"error": "Missing user ids or travel payment values"}), 400

    travel_payment = {
        "travel_pay_to_teacher": travel_payment_to_teacher,
        "travel_pay_from_student": travel_payment_from_student,
        "student_user_id": student_user_id,
        "teacher_user_id": teacher_user_id
    }

    print(f"Received travel payment data: {travel_payment}")

    # Check if the user is an admin
    try:
        is_admin = is_user_admin(client=bq_client, user_id=admin_user_id)
        if not is_admin:
            return jsonify({"error": "User is not an admin"}), 403
    except Exception as e:
        print(f"Error checking admin status: {e}")
        return jsonify({"error": str(e)}), 500


    try:
        update_travel_payment(client=bq_client, travel_payment=travel_payment, admin_user_id=admin_user_id)
        
        return jsonify({"message": "Travel payment updated successfully"}), 200
    except Exception as e:
        print(f"Error updating travel payment: {e}")
        return jsonify({"error": str(e)}), 500
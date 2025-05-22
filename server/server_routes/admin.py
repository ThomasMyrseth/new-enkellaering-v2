from flask import Blueprint, jsonify, request
import os

from .config import token_required
from cloud_sql.gets import is_user_admin
from cloud_sql.alters import update_travel_payment

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/is-admin', methods=["GET"])
@token_required
def is_admin_route(user_id):
    """Check whether the given user is an admin via Cloud SQL"""
    try:
        res = is_user_admin(user_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"is_admin": res}), 200

@admin_bp.route('/update-travel-pay', methods=["POST"])
@token_required
def update_travel_payment_route(user_id):
    """Update travel payment for a user via Cloud SQL"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    admin_user_id = user_id
    travel_to = data.get('travel_pay_to_teacher')
    travel_from = data.get('travel_pay_from_student')
    student_user_id = data.get('student_user_id')
    teacher_user_id = data.get('teacher_user_id')

    if None in (travel_to, travel_from, student_user_id, teacher_user_id):
        return jsonify({"error": "Missing required fields"}), 400

    travel_payment = {
        "travel_pay_to_teacher": travel_to,
        "travel_pay_from_student": travel_from,
        "student_user_id": student_user_id,
        "teacher_user_id": teacher_user_id
    }

    # Verify admin rights
    try:
        if not is_user_admin(admin_user_id):
            return jsonify({"error": "User is not an admin"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Perform update
    try:
        update_travel_payment(travel_payment, admin_user_id)
        return jsonify({"message": "Travel payment updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

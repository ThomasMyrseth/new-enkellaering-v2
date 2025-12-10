from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from .config import generate_token
from db.gets import (
    get_student_by_email,
    get_new_student_by_phone,
    get_teacher_by_email,
)

from db.sql_types import Students, Teacher
from db.inserts import (
    insert_student,
    insert_teacher,
    insert_new_student_order
)

from firebase_admin import auth

auth_bp = Blueprint('auth', __name__)

from .email import welcomeNewStudentEmailToStudent
@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.json

    if (not data or data is None):
        return jsonify({"error": "No data provided"}), 400
    
    try:
        id_token = data.get('id_token')
        decoded = auth.verify_id_token(id_token)
        user_id = decoded.get('uid')

        firstname_parent = data.get("firstname_parent")
        lastname_parent = data.get("lastname_parent")
        email_parent = data.get("email_parent")
        phone_parent = data.get("phone_parent")
        firstname_student = data.get("firstname_student")
        lastname_student = data.get("lastname_student")
        created_at = datetime.now().isoformat()
        main_subjects = data.get("main_subjects") or ""
        additional_comments = data.get("additional_comments") or ""
        address = data.get("address")
        postal_code = data.get("postal_code")
        est_hours_per_week = float(data.get("hours_per_week") or 2)
        has_physical_tutoring = data.get("has_physical_tutoring", True)

        if not all([firstname_parent, lastname_parent, email_parent, phone_parent, firstname_student, lastname_student]):
            return jsonify({"error": "All required fields must be filled."}), 400

        existing = get_student_by_email(email_parent)
        if existing:
            return jsonify({"error": "User with this email already exists."}), 400

        new_student = Students(
            user_id=user_id,
            firstname_parent=firstname_parent,
            lastname_parent=lastname_parent,
            email_parent=email_parent,
            phone_parent=phone_parent,
            firstname_student=firstname_student,
            lastname_student=lastname_student,
            phone_student=data.get("phone_student"),
            created_at=created_at,
            main_subjects=main_subjects,
            additional_comments=additional_comments,
            address=address,
            postal_code=postal_code,
            est_hours_per_week=est_hours_per_week,
            has_physical_tutoring=has_physical_tutoring,
            is_active=True
        )
        insert_student(new_student)

        token = generate_token(user_id)
        logging.info(f"Student {user_id} registered.")

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        logging.error(f"Error saving user: {e}")
        return jsonify({"error": str(e)}), 500
    
    #send email
    try:
        welcomeNewStudentEmailToStudent(email_parent, firstname_parent)
    except Exception as e:
        logging.error(f"Error sending welcome email: {e}")
        return jsonify({"error": "User registered, but failed to send welcome email."}), 500
    
    return jsonify({"message": "User registered successfully.", "user_id": user_id, "token": token}), 200
    


@auth_bp.route('/signup-teacher', methods=['POST'])
def register_teacher():
    data = request.json

    if (not data or data is None):
        return jsonify({"error": "No data provided"}), 400
    try:
        decoded = auth.verify_id_token(data.get('id_token'))
        user_id = decoded.get('uid')
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        phone = data.get("phone")
        address = data.get("address") or "N/A"
        postal_code = data.get("postal_code") or "0000"
        hourly_pay = data.get("hourly_pay") or "250"
        created_at = datetime.now().isoformat()
        additional_comments = data.get("additional_comments") or ""
        location = data.get('location')
        physical = data.get('physical_tutouring')
        digital = data.get('digital_tutouring')

        if not all([firstname, lastname, email, phone]):
            return jsonify({"error": "All required fields must be filled."}), 400

        new_teacher = Teacher(
            user_id=user_id,
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            address=address,
            postal_code=postal_code,
            hourly_pay=hourly_pay,
            resigned=False,
            created_at=created_at,
            admin=False,
            resigned_at=None,
            additional_comments=additional_comments,
            location=location,
            physical_tutouring=physical,
            digital_tutouring=digital
        )
        insert_teacher(new_teacher)

        token = generate_token(user_id)
        logging.info(f"Teacher {user_id} registered.")
        return jsonify({"message": "User registered successfully.", "user_id": user_id, "token": token}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        logging.error(f"Error saving teacher: {e}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():

    data = request.json
    if (not data or data is None):
        return jsonify({"error": "No data provided"}), 400
    
    try:
        id_token = data.get('id_token')
        decoded = auth.verify_id_token(id_token)
        email = decoded.get('email')
        if not email:
            return jsonify({"error": "Invalid token"}), 401

        users = get_student_by_email(email)
        if not users:
            return jsonify({"error": "User not found"}), 401

        user = users[0]
        token = generate_token(user['user_id'])
        return jsonify({"message": "Login successful", "user_id": user['user_id'], "token": token}), 200

    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500

@auth_bp.route('/login-teacher', methods=['POST'])
def login_teacher():
    data = request.json
    if (not data or data is None):
        return jsonify({"error": "No data provided"}), 400
    try:
        id_token = data.get('id_token')
        decoded = auth.verify_id_token(id_token)
        email = decoded.get('email')
        if not email:
            return jsonify({"error": "Invalid token"}), 401

        teachers = get_teacher_by_email(email)
        if not teachers:
            return jsonify({"error": "User not found"}), 401

        user = teachers[0]
        token = generate_token(user['user_id'])
        return jsonify({"message": "Login successful", "user_id": user['user_id'], "token": token}), 200

    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logout successful"})
    response.set_cookie('token', '', expires=0, httponly=True, secure=True, samesite='None')
    return response, 200

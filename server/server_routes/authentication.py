from flask import Blueprint, request, jsonify, session
from flask import request, jsonify, session
from google.cloud import bigquery
from datetime import datetime
import os
from big_query.bq_types import Students, Teacher
from firebase_admin import auth
import logging

from .config import bq_client 
from .config import generate_token

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


auth_bp = Blueprint('auth', __name__)


from big_query.inserts import insert_new_student_order
from big_query.gets import get_student_by_email
from big_query.inserts import insert_student
from big_query.gets import get_new_student_by_phone
from big_query.alters import setHasSignedUp
@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.json

    try:
        # Validate Firebase ID Token
        id_token = data.get('id_token')
        decoded_token = auth.verify_id_token(id_token)
        firebase_user_id = decoded_token.get('uid')

        # Extract data
        user_id = firebase_user_id
        firstname_parent = data.get("firstname_parent")
        lastname_parent = data.get("lastname_parent")
        email_parent = data.get("email_parent")
        phone_parent = data.get("phone_parent")
        firstname_student = data.get("firstname_student")
        lastname_student = data.get("lastname_student")
        phone_student = data.get("phone_student")
        created_at = datetime.now()
        main_subjects = data.get("main_subjects") or ""
        additional_comments = data.get("additional_comments") or ""
        address = data.get("address")
        postal_code = data.get("postal_code")
        est_hours_per_week = float(data.get("hours_per_week")) or 2
        has_physical_tutoring = data.get("has_physical_tutoring", True)  # Default to True
        preferred_teacher = data.get('selected_teacher_user_id') or ''

        # Validate required fields
        if not all([firstname_parent, lastname_parent, email_parent, phone_parent, firstname_student, lastname_student]):
            return jsonify({"error": "All required fields must be filled."}), 400

        # Check for existing user
        print(f"Checking if email {email_parent} exists in the database.")
        existing_user = get_student_by_email(email=email_parent, client=bq_client)
        if existing_user:
            return jsonify({"error": "User with this email already exists."}), 400

        # Create a student object
        new_student = Students(
            user_id=user_id,
            firstname_parent=firstname_parent,
            lastname_parent=lastname_parent,
            email_parent=email_parent,
            phone_parent=phone_parent,
            firstname_student=firstname_student,
            lastname_student=lastname_student,
            phone_student=phone_student,
            created_at=created_at,
            main_subjects=main_subjects,
            additional_comments=additional_comments,
            address=address,
            postal_code=postal_code,
            est_hours_per_week = est_hours_per_week,
            has_physical_tutoring=has_physical_tutoring,
        )

        # Insert the new student into the database
        print(f"Inserting student {user_id} into the database.")
        insert_student(client=bq_client, student=new_student)

        if preferred_teacher:
            insert_new_student_order(student_user_id=user_id, teacher_user_id=preferred_teacher, accept=False, physical_or_digital=None, bq_client=bq_client)
        

        #check if the phoneNumber exisist in new_students table
        res = get_new_student_by_phone(client=bq_client, phone=phone_parent)
        e = res.errors

        if e:
            return jsonify({"Error": f"An error occured while looking in newStudents, {e}"}), 500
        
       
        results_iterator = res.result()  # This is a RowIterator

        # Convert to a list so we can do len()
        rows_list = list(results_iterator)
        print("existing new students: ", rows_list)
        if len(rows_list) > 0:
            print("User has an entry in new_students_table:", rows_list)
            setHasSignedUp(client=bq_client, phone=phone_parent)
        else:
            print("No entry found in new_students_table")

        # Save user_id in session
        session['user_id'] = user_id
        token = generate_token(user_id)

        logging.info(f"Student {user_id} successfully registered.")

        return jsonify({"message": "User registered successfully.", "user_id": user_id, "token": token}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        logging.error(f"Error saving user: {str(e)}")
        return jsonify({"error": f"Error saving user: {str(e)}"}), 500
    


from big_query.inserts import insert_teacher
@auth_bp.route('/signup-teacher', methods=["POST"])
def register_teacher():
    try:
        data = request.json

        id_token = data.get('id_token')
        decoded_token = auth.verify_id_token(id_token)
        firebase_user_id = decoded_token.get('uid')

        # Generate a unique user ID
        user_id = firebase_user_id
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        phone = data.get("phone")
        address = data.get("address") or "N/A"
        postal_code = data.get("postal_code") or "0000"
        hourly_pay = data.get("hourly_pay") or "250"
        resigned = False
        created_at = datetime.now()
        admin = False
        resigned_at = None
        additional_comments = data.get("additional_comments") or ""
        location = data.get('location')
        physical = data.get('physical_tutouring')
        digital = data.get('digital_tutouring')

        # Validate required fields
        if not all([firstname, lastname, email, phone]):
            return jsonify({"error": "All required fields must be filled."}), 400

        # Create a new teacher object
        new_teacher = Teacher(
            user_id=user_id,
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            address=address,
            postal_code=postal_code,
            hourly_pay=hourly_pay,
            resigned=resigned,
            created_at=created_at,
            admin=admin,
            resigned_at=resigned_at,
            additional_comments=additional_comments,
            location=location,
            physical_tutouring=physical,
            digital_tutouring=digital
        )

        # Insert the new teacher into the database
        print(f"Inserting teacher {user_id} into the database.")
        insert_teacher(client=bq_client, teacher=new_teacher)

        # Save minimal user data in session
        session['user_id'] = user_id
        token = generate_token(user_id=user_id)

        logging.info(f"Teacher {user_id} successfully registered.")
        return jsonify({
            "message": "User registered successfully.",
            "user_id": user_id,
            "token": token    
        }), 200

    except Exception as e:
        logging.error(f"Error saving teacher: {str(e)}")
        return jsonify({"error": f"Error saving user: {str(e)}"}), 500
    


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Get the Firebase ID token from the request
        data = request.get_json()
        id_token = data.get('id_token')
        if not id_token:
            logging.error("Missing ID token in request.")
            return jsonify({"error": "Missing ID token"}), 400

        # Verify and decode the Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get('email')
        if not email:
            logging.error("Email not found in the decoded token.")
            return jsonify({"error": "Invalid token: email not found"}), 401

        # Query BigQuery for user data
        query = f"""
            SELECT user_id, firstname_parent, lastname_parent, firstname_student, lastname_student
            FROM `{USER_DATASET}.students` 
            WHERE email_parent = @Email 
            LIMIT 1
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("Email", "STRING", email)]
        )
        results = list(bq_client.query(query, job_config=job_config))

        if not results:
            logging.warning(f"No user found with email: {email}")
            return jsonify({"error": "User not found"}), 401

        # Extract user data from query results
        user = results[0]
        user_id = user["user_id"]

        # Save user session with minimal data
        session['user_id'] = str(user_id) or "default_user_id"
        token = generate_token(user_id)

        return jsonify({"message": "Login successful", "user_id": user_id, "token": token}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500



@auth_bp.route('/login-teacher', methods=['POST'])
def login_teacher():
    print("loggin in new teacher")
    try:
        # Get the Firebase ID token from the request
        id_token = request.json.get('id_token')
        if not id_token:
            logging.error("Missing ID token in request.")
            return jsonify({"error": "Missing ID token"}), 400

        # Verify and decode the Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get('email')
        if not email:
            logging.error("Email not found in the decoded token.")
            return jsonify({"error": "Invalid token: email not found"}), 401

        # Query BigQuery for user data
        query = f"""
            SELECT user_id, firstname, lastname 
            FROM `{USER_DATASET}.teachers` 
            WHERE email = @Email 
            LIMIT 1
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("Email", "STRING", email)]
        )
        results = list(bq_client.query(query, job_config=job_config))

        if not results:
            logging.warning(f"No user found with email: {email}")
            return jsonify({"error": "User not found"}), 401

        # Extract user data from query results
        user = results[0]
        user_id = user["user_id"]
        print("logged in user id is", user_id)
        token = generate_token(user['user_id'])


        return jsonify({"message": "Login successful", "userId": user_id, "token": token}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        # Clear the JWT cookie by setting it to expire immediately
        response = jsonify({"message": "Logout successful"})
        response.set_cookie('token', '', expires=0, httponly=True, secure=True, samesite='None')
        logging.info("User successfully logged out.")
        return response, 200
    except Exception as e:
        logging.error(f"Error during logout: {str(e)}")
        return jsonify({"error": "Logout failed", "details": str(e)}), 500

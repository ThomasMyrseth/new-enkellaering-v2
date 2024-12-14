from flask import Flask, request, jsonify, session
from google.cloud import bigquery
from datetime import datetime
from dotenv import load_dotenv
import os
import uuid
from big_query.bq_types import Students, Teachers
from flask_session import Session
from redis import Redis
from flask_cors import CORS
from dotenv import load_dotenv
from firebase_admin import auth
import firebase_config  # Ensure this initializes Firebase Admin
import logging
from datetime import timedelta



# Load environment variables from .env file
load_dotenv()

from auth.hash_password import hash_password, check_password
from big_query.gets import get_student_by_email, get_teacher_by_email, get_teacher_by_user_id, get_classes_by_teacher, get_student_for_teacher, get_student_by_user_id, get_teacher_for_student
from big_query.inserts import insert_student, insert_teacher, insert_class
from big_query.bq_types import Classes


app = Flask(__name__)

app.secret_key = os.getenv("APP_SECRET")
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'enkel-laering:'
app.config['SESSION_REDIS'] = Redis(host='localhost', port=6379)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = True #use TRUE for production
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:3000"]}})
Session(app)



PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')

logging.basicConfig(level=logging.INFO)

bq_client = bigquery.Client.from_service_account_json('google_service_account.json')





from functools import wraps
from flask import session, redirect, url_for

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))  # or return a JSON response
        return f(*args, **kwargs)
    return decorated_function

@app.route('/protected-route')
@login_required
def protected_route():
    return "This is a protected route"



@app.route('/get-teacher', methods=['POST'])
def get_current_teacher():
    data = request.get_json()
    user_id = data.get('user_id')  # Use .get() to avoid KeyError

    if not user_id:
        print("user id not found in request payload!")
        return jsonify({"error": "User ID is required."}), 400

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




@app.route('/signup', methods=['POST'])
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
        main_subjects = data.get("main_subjects")
        additional_comments = data.get("additional_comments") or ""
        address = data.get("address")
        postal_code = data.get("postal_code")
        has_physical_tutoring = data.get("has_physical_tutoring", False)  # Default to False

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
            has_physical_tutoring=has_physical_tutoring
        )

        # Insert the new student into the database
        print(f"Inserting student {user_id} into the database.")
        insert_student(client=bq_client, student=new_student)

        # Save user_id in session
        session['user_id'] = user_id
        session['firstname'] = firstname_student
        session['lastname'] = lastname_student
        session['email'] = email_parent
        logging.info(f"Student {user_id} successfully registered.")

        return jsonify({"message": "User registered successfully.", "user_id": user_id}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        logging.error(f"Error saving user: {str(e)}")
        return jsonify({"error": f"Error saving user: {str(e)}"}), 500
    



@app.route('/signup-teacher', methods=["POST"])
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

        # Validate required fields
        if not all([firstname, lastname, email, phone]):
            return jsonify({"error": "All required fields must be filled."}), 400

        # Create a new teacher object
        new_teacher = Teachers(
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
            additional_comments=additional_comments
        )

        # Insert the new teacher into the database
        print(f"Inserting teacher {user_id} into the database.")
        insert_teacher(client=bq_client, teacher=new_teacher)

        # Save minimal user data in session
        session['user_id'] = user_id

        logging.info(f"Teacher {user_id} successfully registered.")
        return jsonify({
            "message": "User registered successfully.",
            "user_id": user_id    
        }), 200

    except Exception as e:
        logging.error(f"Error saving teacher: {str(e)}")
        return jsonify({"error": f"Error saving user: {str(e)}"}), 500
    


@app.route('/login', methods=['POST'])
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
        session['user_id'] = user_id
        session['role'] = "student"
        session['firstname_parent'] = user['firstname_parent']
        session['lastname_parent'] = user['lastname_parent']
        session['email_parent'] = email
        session['firstname_student'] = user['firstname_student']
        session['lastname_student'] = user['lastname_student']

        print(f"User {user_id} successfully logged in.")

        return jsonify({"message": "Login successful", "user_id": user_id}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500



@app.route('/login-teacher', methods=['POST'])
def login_teacher():
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

        # Save user session with minimal data
        session['user_id'] = user_id
        session['firstname'] = user['firstname']
        session['lastname'] = user['lastname']
        session['email'] = email

        print(f"User {user_id} successfully logged in.")

        return jsonify({"message": "Login successful", "userId": user_id}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500


@app.route('/logout', methods=['POST'])
def logout():
    try:
        # Clear the user's session
        session.clear()
        logging.info("User successfully logged out.")
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        logging.error(f"Error during logout: {str(e)}")
        return jsonify({"error": "Logout failed", "details": str(e)}), 500




@app.route('/fetch-classes-for-teacher', methods=["POST"])
def fetch_classes_for_teacher():
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        print("user id not found")
        raise Exception("user id not found")


    classes = get_classes_by_teacher(cliet=bq_client, user_id=user_id)
    
    classes_data = [dict(row) for row in classes]  # Assuming multiple rows, adjust as needed
    if len(classes_data)==0:
        return jsonify({"classes": []}), 200


    return jsonify({
        "classes": classes_data
    }), 200

@app.route('/get-students', methods=["POST"])
def get_students():
    data = request.get_json()
    user_id = data.get('user_id')

    students = get_student_for_teacher(client=bq_client, teacher_user_id=user_id)
    students_data = [dict(row) for row in students]  # Assuming multiple rows, adjust as needed

    return jsonify({
        "students" : students_data
    }), 200

@app.route('/upload-new-class', methods=["POST"])
def upload_new_class():
    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    student_user_id = data.get('student_user_id')
    started_at = data.get("started_at")
    ended_at = data.get("ended_at")
    comment = data.get("comment")
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
        invoiced_student_at=invoiced_student_at
    )

    try:
        response = insert_class(client=bq_client, class_obj=new_class)
        if response:
            print("inserted new class successfully")
            return jsonify({"message": "Class inserted successfully"}), 200
    except Exception as e:
        print(f"error {e}")
        return jsonify({"message": f"Error inserting new class {e}"}), 500


@app.route('/get-student', methods=["POST"])
def get_student():
    data = request.get_json()
    user_id = data.get('user_id')

    res = get_student_by_user_id(client=bq_client, user_id=user_id)

    if not res or res.errors:
        return jsonify({"message": "failed to fetch student"}), 400
    
    students = [dict(row) for row in res]  # Assuming multiple rows, adjust as needed

    return {
        "student": students[0]
    }, 200

@app.route('/get-teacher-for-student', methods=["POST"])
def get_teacher_for_student_route():
    data = request.get_json()
    user_id = data.get('user_id')

    res = get_teacher_for_student(client=bq_client, student_user_id=user_id)

    if not res or res.errors:
        print(res.errors)
        return jsonify({"message": "failed to fetch teacher"}), 400
    
    data = res.result()
    teacher_data = [dict(row) for row in data]  # Assuming multiple rows, adjust as needed

    if len(teacher_data)==0:
        return jsonify({
            "teacher": []
        }), 200

    return jsonify({
        "teacher": teacher_data[0]
    }), 200


if __name__ == "__main__":
    app.run(debug=True, port=8080)

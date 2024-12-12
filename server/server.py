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


# Load environment variables from .env file
load_dotenv()

from auth.hash_password import hash_password, check_password
from big_query.gets import get_student_by_email, get_teacher_by_email
from big_query.inserts import insert_student, insert_teacher


app = Flask(__name__)

app.secret_key = os.getenv("APP_SECRET")
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'file-manager:'
app.config['SESSION_REDIS'] = Redis(host='localhost', port=6379)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False #use TRUE for production
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:3000"]}})
Session(app)



PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')

client = bigquery.Client.from_service_account_json('google_service_account.json')







@app.route('/signup', methods=['POST'])
def register():
    data = request.json

    user_id = str(uuid.uuid4())
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
    has_physical_tutoring = data.get("has_physical_tutoring", False)  # Default to False if not provided
    password = data.get("password")



    # Validate required fields
    if not all([firstname_parent, lastname_parent, email_parent, phone_parent, firstname_student, lastname_student, password]):
        return jsonify({"error": "All required fields must be filled."}), 400

    password_hash = hash_password(password)



    #check if user already exisst
    existing_user = get_student_by_email(email=email_parent)

    if len(existing_user)>0:
        return jsonify({"error": "User with this email already exists."}), 400
    
     # Create a student object
    new_student = Students(
        user_id= user_id,
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
        password_hash=password_hash,
        address=address,
        postal_code=postal_code,
        has_physical_tutoring=has_physical_tutoring
    )

    # Insert the new student into the database
    try:
        insert_student(client=client, student=new_student)
        return jsonify({"message": "User registered successfully."}), 201
    except Exception as e:
        return jsonify({"error": f"Error saving user: {str(e)}"}), 500
    

@app.route('/signup-teacher', methods=["POST"])
def register_teacher():
    data = request.json

    user_id = str(uuid.uuid4())
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address") or "N/A"
    postal_code = data.get("postal_code") or "0000"
    hourly_pay = data.get("hourly_pay") or "250"
    resigned = False
    password = data.get("password")
    created_at = datetime.now()
    admin = False
    resigned_at = None
    additional_comments = data.get("additional_comments") or ""


    # Validate required fields
    if not all([firstname, lastname, email, phone, password]):
        return jsonify({"error": "All required fields must be filled."}), 400

    password_hash = hash_password(password)



    #check if user already exisst
    existing_user = get_teacher_by_email(email=email)

    if len(existing_user)>0:
        return jsonify({"error": "User with this email already exists."}), 400
    
     # Create a student object
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
        password_hash=password_hash,
        created_at=created_at,
        admin=admin,
        resigned_at=resigned_at,
        additional_comments=additional_comments
    )

    # Insert the new student into the database
    try:
        insert_teacher(client=client, teacher=new_teacher)
        print("inserted new teacher succesfully")
        return jsonify({"message": "User registered successfully."}), 201
    except Exception as e:
        return jsonify({"error": f"Error saving user: {str(e)}"}), 500
    


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required."}), 400

    bq_client = bigquery.Client()

    # Fetch user data
    query = f"SELECT user_id, email, password_hash FROM `{USER_DATASET}.students` WHERE email = @Email"
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("Email", "STRING", email)]
    )
    results = list(bq_client.query(query, job_config=job_config))

    if not results:
        return jsonify({"error": "Invalid email or password."}), 401

    user = results[0]
    if not check_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid email or password."}), 401

    # Save user session
    session['user_id'] = user['user_id']
    return jsonify({"message": "Login successful."}), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully."}), 200


if __name__ == "__main__":
    app.run(debug=True, port=8080)

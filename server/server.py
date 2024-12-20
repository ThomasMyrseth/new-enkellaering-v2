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
from big_query.gets import get_all_about_me_texts, get_all_students, get_student_by_email, get_all_new_students, get_teacher_by_user_id, get_classes_by_teacher, get_student_for_teacher, get_student_by_user_id, get_teacher_for_student, get_classes_for_student, get_all_classes, get_all_teachers
from big_query.inserts import insert_student, insert_teacher, insert_class, insert_new_student, upsert_about_me_text
from big_query.alters import setClassesToInvoiced, setClassesToPaid
from big_query.bq_types import Classes
from big_query.buckets.uploads import upload_or_replace_image_in_bucket
from big_query.buckets.downloads import download_all_teacher_images


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



@app.route('/get-user-id', methods=['GET'])
def get_user_id():
    user_id = session.get('user_id')
    if user_id:
        return jsonify({'user_id': user_id}), 200
    else:
        return jsonify({'error': 'User not logged in'}), 401
    

@app.route('/get-teacher', methods=['GET'])
def get_current_teacher():
    user_id = session.get('user_id')  # Use .get() to avoid KeyError

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




@app.route('/fetch-classes-for-teacher', methods=["GET"])
def fetch_classes_for_teacher():
    user_id = session.get('user_id')
    

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

@app.route('/get-students', methods=["GET"])
def get_students():
    user_id = session.get('user_id')

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


@app.route('/get-student', methods=["GET"])
def get_student():
    user_id = session.get('user_id')

    res = get_student_by_user_id(client=bq_client, user_id=user_id)

    if not res or res.errors:
        return jsonify({"message": "failed to fetch student"}), 400
    
    students = [dict(row) for row in res]  # Assuming multiple rows, adjust as needed

    return {
        "student": students[0]
    }, 200

@app.route('/get-teacher-for-student', methods=["GET"])
def get_teacher_for_student_route():
    user_id = session.get('user_id')

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

@app.route('/get-classes-for-student', methods=["GET"])
def get_classes_for_student_route():
    user_id = session.get('user_id')

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


@app.route('/get-all-classes', methods=["GET"])
def get_all_classes_route():
    admin_user_id = session.get('user_id')

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

@app.route('/get-all-teachers', methods=["GET"])
def get_all_teachers_route():
    admin_user_id = session.get('user_id')

    if not admin_user_id:
        return jsonify({"message": "Missing admin user id"}), 400
    
    res = get_all_teachers(client=bq_client, admin_user_id=admin_user_id)

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


@app.route('/get-all-students', methods=["GET"])
def get_all_students_route():
    admin_user_id = session.get('user_id')

    if not admin_user_id:
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






@app.route('/get-new-students', methods=["GET"])
def get_new_students_route():
    admin_user_id = session.get('user_id')

    if not admin_user_id:
        return jsonify({
            "message": "Missing admin user id"
        }), 400

    res = get_all_new_students(client=bq_client, admin_user_id=admin_user_id)

    if not res or res.errors:
        print("Error fetching new students")
        return jsonify({
            "message": "Error fetching new students"
        }), 500
    
    result = res.result()
    new_students = [dict(row) for row in result]

    if len(new_students)==0:
        return jsonify({
            "new_students": []
        }), 200
    
    return jsonify({
        "new_students": new_students
    }), 200


from datetime import timezone
from big_query.bq_types import NewStudents
from big_query.alters import alterNewStudent

@app.route('/update-new-student', methods=["POST"])
def update_new_student_workflow():
    data = request.get_json()

    # Validate incoming data
    is_valid, error_message = validate_new_student_data(data)
    if not is_valid:
        print("Validation error:", error_message)
        return jsonify({"message": f"Validation error: {error_message}"}), 400

    # Extract fields
    newStudentId = data["new_student_id"]
    admin_user_id = session.get("user_id")

    # Build the updates dictionary
    update = {
        "has_called": data.get("has_called"),
        "called_at": data.get("called_at"),
        "has_answered": data.get("has_answered"),
        "answered_at": data.get("answered_at"),
        "has_signed_up": data.get("has_signed_up"),
        "signed_up_at": data.get("signed_up_at"),
        "from_referal": data.get("from_referal"),
        "referee_phone": data.get("referee_phone"),
        "has_assigned_teacher": data.get("has_assigned_teacher"),
        "assigned_teacher_at": data.get("assigned_teacher_at"),
        "assigned_teacher_user_id": data.get("teacher_user_id"),
        "has_finished_onboarding": data.get("has_finished_onboarding"),
        "finished_onboarding_at": data.get("finished_onboarding_at"),
        "comments": data.get("comments"),
        "paid_referee": data.get("paid_referee"),
        "paid_referee_at": data.get("paid_referee_at"),
    }

    # Clean the updates dictionary
    update = clean_updates(update)

    # Perform the update
    try:
        res = alterNewStudent(client=bq_client, new_student_id=newStudentId, admin_user_id=admin_user_id, updates=update)
        res.result()  # Force query execution to detect any errors
    except Exception as e:
        print("BigQuery error:", e)
        return jsonify({"message": "Error while setting updates for new student"}), 500

    return jsonify({"message": "Updated new student successfully"}), 200

def clean_updates(updates: dict):
    """Ensure all fields have valid default values."""
    boolean_fields = [
        "has_called", "has_answered", "has_signed_up", "from_referal",
        "has_assigned_teacher", "has_finished_onboarding", "paid_referee"
    ]
    
    timestamp_fields = [
        "called_at", "answered_at", "signed_up_at", "assigned_teacher_at",
        "finished_onboarding_at", "paid_referee_at"
    ]
    
    string_fields = [
        "referee_phone", "assigned_teacher_user_id", "comments"
    ]
    
    # Set default values for missing or `None` fields
    for field in boolean_fields:
        updates[field] = updates.get(field, False)
    
    for field in timestamp_fields:
        updates[field] = updates.get(field) or None  # Keep as `None` if not provided
    
    for field in string_fields:
        updates[field] = updates.get(field) or ""  # Default to ''
    
    return updates

def validate_new_student_data(data: dict) -> tuple[bool, str]:
    """
    Validate the incoming data for updating a new student.

    :param data: Dictionary containing new student data.
    :return: Tuple (is_valid, error_message). If valid, error_message is None.
    """
    required_fields = {
        "new_student_id": str,
        "has_called": bool,
        "has_answered": bool,
        "has_signed_up": bool,
        "from_referal": bool,
        "admin_user_id": str,
        "has_assigned_teacher": bool,
    }

    optional_fields = {
        "called_at": str,
        "answered_at": str,
        "signed_up_at": str,
        "referee_phone": str,
        "assigned_teacher_at": str,
        "teacher_user_id": str,
        "has_finished_onboarding": bool,
        "finished_onboarding_at": str,
        "comments": str,
        "paid_referee": bool,
        "paid_referee_at": str,
    }

    # Check required fields
    for field, field_type in required_fields.items():
        if field not in data:
            return False, f"Missing required field: {field}"
        if not isinstance(data[field], field_type):
            return False, f"Invalid type for field '{field}': Expected {field_type}, got {type(data[field])}"

    # Check optional fields (if provided)
    for field, field_type in optional_fields.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], field_type):
                return False, f"Invalid type for field '{field}': Expected {field_type}, got {type(data[field])}"

    return True, None



@app.route('/set-classes-to-invoiced', methods=["POST"])
def set_classes_to_invoiced_route():
    data = request.get_json()

    admin_user_id = session.get('user_id')
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

@app.route('/set-classes-to-paid', methods=["POST"])
def set_classes_to_paid_route():
    data = request.get_json()

    admin_user_id = session.get('user_id')
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
    
import pytz


@app.route('/submit-new-student', methods = ["POST"])
def submit_new_student_route():
    data = request.get_json()
    phone = data.get("phone")
    norway_tz = pytz.timezone("Europe/Oslo")


    if not phone:
        return jsonify({"message": "Missing phone number"}), 400
    
    ns = NewStudents(
        new_student_id=str(uuid.uuid4()),
        phone=phone,
        created_at=datetime.now(norway_tz),
        has_called=False,
        called_at=None,
        has_answered=False,
        answered_at=None,
        has_signed_up=False,
        signed_up_at=None,
        from_referal=False,
        referee_phone=None,
        referee_name = None,
        has_assigned_teacher=False,
        assigned_teacher_at=None,
        assigned_teacher_user_id=None,
        has_finished_onboarding=False,
        finished_onboarding_at=None,
        comments=None,
        paid_referee=False,
        paid_referee_at=None
    )

    res = insert_new_student(client=bq_client, new_student=ns)

    if not res or res.errors:
        print("An error occured inserting nre student", res.errors)
        return jsonify({
            "message": "An error occured while inserting new student"
        }), 500
    
    print("response: ", res.result())
    return jsonify({"message": "New student successfully inserted"}), 200
    

    

@app.route('/submit-new-referal', methods = ["POST"])
def submit_new_referal_route():
    data = request.get_json()
    referal_phone= data.get("referal_phone")
    referee_phone = data.get("referee_phone")
    referee_name = data.get("referee_name")
    norway_tz = pytz.timezone("Europe/Oslo")


    if not (referal_phone and referee_phone and referee_name):
        return jsonify({"message": "Missing fields for adding new referal"}), 400
    
    ns = NewStudents(
        new_student_id=str(uuid.uuid4()),
        phone=referal_phone,
        created_at=datetime.now(norway_tz),
        has_called=False,
        called_at=None,
        has_answered=False,
        answered_at=None,
        has_signed_up=False,
        signed_up_at=None,
        from_referal=True,
        referee_phone=referee_phone,
        referee_name = referee_name,
        has_assigned_teacher=False,
        assigned_teacher_at=None,
        assigned_teacher_user_id=None,
        has_finished_onboarding=False,
        finished_onboarding_at=None,
        comments=None,
        paid_referee=False,
        paid_referee_at=None
    )

    res = insert_new_student(client=bq_client, new_student=ns)

    if not res or res.errors:
        print("An error occured inserting nre student", res.errors)
        return jsonify({
            "message": "An error occured while inserting new student"
        }), 500
    
    print("response: ", res.result())
    return jsonify({"message": "New student successfully inserted"}), 200
    


import mimetypes


@app.route("/upload-teacher-image", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]  # File object from form
    user_id = session.get("user_id")  # user_id from form data
    about_me = request.form.get("about_me")  # about_me text from form data
    firstname = request.form.get("firstname")
    lastname = request.form.get("lastname")

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    if not firstname:
        return jsonify({"error": "Missing firstname"}), 400
    
    if not lastname:
        return jsonify({"error": "Missing lastname"}), 400

    if not about_me:
        return jsonify({"error": "Missing about_me text"}), 400

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400



    mimetype = file.mimetype
    file_extension = mimetypes.guess_extension(mimetype)
    standardized_filename = f"{user_id}-profile_picture{file_extension}"

    # Define Google Cloud Storage bucket and path
    bucket_name = "enkellaering_images"
    destination_blob_name = f"teacher_images/{user_id}/{standardized_filename}"



    try:
        # Upload directly from file object
        upload_or_replace_image_in_bucket(bucket_name, file, destination_blob_name)

        # Insert about_me text into BigQuery
        upsert_about_me_text(client=bq_client, user_id=user_id, text=about_me, firstname=firstname, lastname=lastname)

        return jsonify({"message": f"File uploaded successfully to {destination_blob_name}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-all-teacher-images-and-about-mes', methods=["GET"])
def get_all_images_and_about_mes():
    try:
        # Fetch about me texts
        about_mes = get_all_about_me_texts(client=bq_client)

        # Fetch teacher images
        images = download_all_teacher_images()

        if not about_mes:
            return jsonify({"message": "Error getting about me texts"}), 500
        
        if not images:
            return jsonify({"message": "Error getting images"}), 500

        return jsonify({
            "about_mes": about_mes,
            "images": images
        }), 200
    
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8080)

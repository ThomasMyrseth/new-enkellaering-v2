from flask import Flask, request, jsonify, session
from google.cloud import bigquery
from datetime import datetime
from dotenv import load_dotenv
import os
import uuid
from big_query.bq_types import Students, Teachers
from flask.sessions import SessionInterface, SessionMixin
from flask_cors import CORS
from dotenv import load_dotenv
from firebase_admin import auth
import logging
from datetime import timedelta
from google.cloud import firestore
from uuid import uuid4
from firebase_admin import credentials, initialize_app
from functools import wraps
from flask import session
import jwt

from big_query.gets import get_all_about_me_texts, get_all_students, get_student_by_email, get_all_new_students, get_teacher_by_user_id, get_classes_by_teacher, get_student_for_teacher, get_student_by_user_id, get_teacher_for_student, get_classes_for_student, get_all_classes, get_all_teachers, get_new_student_by_phone, get_classes_for_teacher
from big_query.inserts import insert_student, insert_teacher, insert_class, insert_new_student, upsert_about_me_text
from big_query.alters import setClassesToInvoiced, setClassesToPaid, setHasSignedUp, setYourTeacher, setYourTeacherByuserId, setStudentToInactive, setStudentToActive, toggleWantMoreStudents, updateStudentNotes
from big_query.deletes import hideNewStudent
from big_query.bq_types import Classes
from big_query.buckets.uploads import upload_or_replace_image_in_bucket
from big_query.buckets.downloads import download_all_teacher_images

 
load_dotenv()
app = Flask(__name__)

# Configure logging, environment variables, etc.
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for Flask application")
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'enkel_laering_prefix'
app.config['SESSION_COOKIE_NAME'] = 'enkel_laering_coockie'
app.config['SESSION_COOKIE_HTTPONLY'] = True
#app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOCKIE_SECURE'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
#app.config['SESSION_COOKIE_DOMAIN'] = 'enkellaering-service-895641904484.europe-west2.run.app'
app.config['SESSION_COOKIE_DOMAIN'] = 'localhost'

CORS(app, resources={
    r"/*": {
        "origins": [
            "https://new-enkellaering-v2.vercel.app",
            "http://localhost:3000",
            "https://enkellaering.no",
            "https://www.enkellaering.no"
        ]
    }
}, supports_credentials=True)

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


logging.basicConfig(level=logging.INFO)

# Firestore client
firestore_client = firestore.Client(project='enkel-laering')

# BigQuery Client
bq_client = bigquery.Client.from_service_account_json('google_service_account.json')




from flask.sessions import SessionInterface, SessionMixin
from datetime import datetime, timedelta
from uuid import uuid4
import logging

class FirestoreSession(dict, SessionMixin):
    """
    Our custom session class that extends dictionary-like behavior
    and Flask's SessionMixin.
    """
    pass


class FirestoreSessionInterface(SessionInterface):
    """
    A session interface that stores session data in Firestore.
    """

    def __init__(self, db_client, collection_name="sessions"):
        self.db_client = db_client
        self.collection_name = collection_name

    def _get_doc_ref(self, session_id):
        return self.db_client.collection(self.collection_name).document(session_id)

    def open_session(self, app, request):
        """Load session data from Firestore, if it exists."""
        cookie_name = app.config.get('SESSION_COOKIE_NAME', 'session')
        session_id = request.cookies.get(cookie_name)
        if session_id:
            try:
                doc_ref = self._get_doc_ref(session_id)
                doc = doc_ref.get()
                if doc.exists:
                    data = doc.to_dict()
                    expires_at_str = data.get('expires_at')
                    if expires_at_str:
                        expires_at = datetime.fromisoformat(expires_at_str)
                        if datetime.utcnow() > expires_at:
                            # Session expired; return a new empty session
                            return FirestoreSession()
                    return FirestoreSession(data)
            except Exception as e:
                app.logger.error(f"Error retrieving session {session_id}: {e}")
        return FirestoreSession()

    def save_session(self, app, session, response):
        """Save or clear session data in Firestore, then set the cookie."""
        cookie_name = app.config.get('SESSION_COOKIE_NAME', 'session')

        # 1. If session is empty, remove from Firestore (cleanup) and return
        if not session:
            session_id = request.cookies.get(cookie_name)
            if session_id is not None:
                try:
                    doc_ref = self._get_doc_ref(session_id)
                    doc_ref.delete()
                except Exception as e:
                    app.logger.error(f"Error deleting session {session_id}: {e}")
            return

        # 2. Otherwise, upsert the session into Firestore
        session_id = request.cookies.get(cookie_name)
        # If there is no cookie, generate a fresh session ID
        if not session_id:
            session_id = str(uuid4())

        # 3. Set session expiration
        expires_at = datetime.now() + app.config.get('PERMANENT_SESSION_LIFETIME', timedelta(hours=1))
        session['expires_at'] = expires_at.isoformat()

        # 4. Write session data to Firestore
        try:
            doc_ref = self._get_doc_ref(session_id)
            doc_ref.set(dict(session))  # Convert the session to a dict
        except Exception as e:
            app.logger.error(f"Error saving session {session_id}: {e}")

        # 5. Set the cookie; ensure both `cookie_name` and `session_id` are strings
        response.set_cookie(
            cookie_name,               # Must be a string
            str(session_id),           # Must be a string
            httponly=True,
            secure=app.config['SESSION_COOKIE_SECURE'],
            samesite=app.config['SESSION_COOKIE_SAMESITE'],
        )

    def is_null_session(self, session):
        """Tell Flask if the session is empty."""
        # Return True if `session` is None or has no keys
        return not session or len(session) == 0




# Use our custom session interface
app.session_interface = FirestoreSessionInterface(firestore_client)


# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase_service_account.json")
initialize_app(cred)



SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_super_secret_key')
from datetime import timezone
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=1),  # Token expiration
        'iat': datetime.now(timezone.utc)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    logging.info(f"Generated token for user_id {user_id}: {token}")
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        logging.info(f"Decoded token payload: {payload}")
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        logging.warning("Token has expired.")
        return None
    except jwt.InvalidTokenError:
        logging.warning("Invalid token.")
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # JWT is expected in the Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            logging.warning("Token is missing in the request.")
            return jsonify({'error': 'Token is missing!'}), 401

        user_id = decode_token(token)
        if not user_id:
            logging.warning("Token is invalid or expired.")
            return jsonify({'error': 'Token is invalid or expired!'}), 401

        # Pass the user_id to the route function
        return f(user_id, *args, **kwargs)

    return decorated

@app.route('/hello', methods=["GET"])
def hello_route():
    return jsonify({"message": f"Hello World!"})



@app.route('/get-user-id', methods=['GET'])
@token_required
def get_user_id(user_id):
    if user_id:
        return jsonify({'user_id': user_id}), 200
    else:
        return jsonify({'error': 'User not logged in'}), 401
    

@app.route('/get-teacher', methods=['GET'])
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
        main_subjects = data.get("main_subjects") or ""
        additional_comments = data.get("additional_comments") or ""
        address = data.get("address")
        postal_code = data.get("postal_code")
        est_hours_per_week = float(data.get("hours_per_week")) or 2
        has_physical_tutoring = data.get("has_physical_tutoring", True)  # Default to True

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
            has_physical_tutoring=has_physical_tutoring
        )

        # Insert the new student into the database
        print(f"Inserting student {user_id} into the database.")
        insert_student(client=bq_client, student=new_student)

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
        session['user_id'] = str(user_id) or "default_user_id"
        token = generate_token(user_id)

        return jsonify({"message": "Login successful", "user_id": user_id, "token": token}), 200

    except auth.InvalidIdTokenError:
        logging.error("Invalid Firebase ID token.")
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        logging.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500



@app.route('/login-teacher', methods=['POST'])
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


@app.route('/logout', methods=['POST'])
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



@app.route('/fetch-classes-for-teacher', methods=["GET"])
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

@app.route('/get-students', methods=["GET"])
@token_required
def get_students(user_id):

    if not user_id:
        return jsonify({"message": "missing user id"})
    
    students = get_student_for_teacher(client=bq_client, teacher_user_id=user_id)
    students_data = [dict(row) for row in students]  # Assuming multiple rows, adjust as needed

    return jsonify({
        "students" : students_data
    }), 200

@app.route('/upload-new-class', methods=["POST"])
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


@app.route('/get-student', methods=["GET"])
@token_required
def get_student(user_id):

    res = get_student_by_user_id(client=bq_client, user_id=user_id)

    if not res or res.errors:
        return jsonify({"message": "failed to fetch student"}), 400
    
    students = [dict(row) for row in res]  # Assuming multiple rows, adjust as needed

    return {
        "student": students[0]
    }, 200

@app.route('/get-teacher-for-student', methods=["GET"])
@token_required
def get_teacher_for_student_route(user_id):

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




@app.route('/get-classes-for-teacher', methods=["GET"])
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


@app.route('/get-all-classes', methods=["GET"])
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

@app.route('/get-all-teachers', methods=["GET"])
@token_required
def get_all_teachers_route(user_id):
    admin_user_id = user_id

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






@app.route('/get-new-students', methods=["GET"])
@token_required
def get_new_students_route(user_id):
    admin_user_id = user_id

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


from big_query.bq_types import NewStudents
from big_query.alters import alterNewStudent

@app.route('/update-new-student', methods=["POST"])
@token_required
def update_new_student_workflow(user_id):
    admin_user_id = user_id
    data = request.get_json()

    logging.info(f"data from update new student: {data}")

    # Validate incoming data
    is_valid, error_message = validate_new_student_data(data)
    if not is_valid:
        logging.info("Validation error:", error_message)
        return jsonify({"message": f"Validation error: {error_message}"}), 400

    # Extract fields
    new_student_id = data.get("new_student_id")
    phone = data.get("phone")

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
        res = alterNewStudent(client=bq_client, new_student_id=new_student_id, admin_user_id=admin_user_id, updates=update)
        res.result()  # Force query execution to detect any errors
    except Exception as e:
        logging.error("BigQuery error:", e)
        return jsonify({"message": "Error while setting updates for new student"}), 500
    
    #set your_teacher in users.students if assigned_teacher_user_id!=NULL
    if  data.get("has_assigned_teacher")==True and data.get("teacher_user_id")!=None:
        try:
            res = setYourTeacher(client=bq_client, phone=phone, your_teacher=data.get("teacher_user_id"))
            res.result()  # Force query execution to detect any errors
        except Exception as e:
            logging.error("Bigquery errror while setting your_teacher", e)
            return jsonify({"message": "Error while setting the teacher in users.students"}), 500


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



@app.route('/hide-new-student', methods=["POST"])
@token_required
def delete_new_student(user_id):
    admin_user_id = user_id
    data = request.get_json()

    # Extract fields
    new_student_id = data.get("new_student_id")

    # Perform the update
    try:
        res = hideNewStudent(client=bq_client, new_student_id=new_student_id, admin_user_id=admin_user_id)
        res.result()  # Force query execution to detect any errors
    except Exception as e:
        logging.error("BigQuery error:", e)
        return jsonify({"message": "Error while deleting for new student"}), 500

    return jsonify({"message": "New student deleted successfully"}), 200


@app.route('/set-classes-to-invoiced', methods=["POST"])
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

@app.route('/set-classes-to-paid', methods=["POST"])
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
@token_required
def upload_file(user_id):
    if "file" not in request.files:
        logging.error("No file found in teacher image upload")
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]  # File object from form
    about_me = request.form.get("about_me")  # about_me text from form data
    firstname = request.form.get("firstname")
    lastname = request.form.get("lastname")
    
    if not firstname:
        logging.error("Missing firstname")
        return jsonify({"error": "Missing firstname"}), 400
    
    if not lastname:
        logging.error("Missing lastname")
        return jsonify({"error": "Missing lastname"}), 400

    if not about_me:
        logging.error("Missing about_me_text")
        return jsonify({"error": "Missing about_me text"}), 400

    if file.filename == "":
        logging.error("No selected file")
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
        logging.error(f"An error occured, {str(e)}")
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

@app.route("/assign-teacher-for-student", methods=["POST"])
@token_required
def assign_teacher_for_student(user_id):
    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    student_user_id = data.get('student_user_id')

    if not teacher_user_id or not student_user_id:
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        response = setYourTeacherByuserId(client=bq_client, student_user_id=student_user_id, teacher_user_id=teacher_user_id, admin_user_id=user_id)

        response.result()
        return jsonify({"message": "Teacher assigned successfully"}), 200
    except Exception as e:
        return jsonify({"An error occured"}), 500
    

@app.route('/set-student-to-inactive', methods=["POST"])
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

@app.route('/set-student-to-active', methods=["POST"])
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


@app.route('/toggle-wants-more-students', methods=["POST"])
@token_required
def toggle_want_more_students_route(user_id):
    data = request.get_json()
    wants_more_students = data.get('wants_more_students') or False

    res = toggleWantMoreStudents(client=bq_client, wants_more_students=wants_more_students, teacher_user_id=user_id)

    if not res or res.errors:
        print("Error setting student to active", res.errors)
        return jsonify({"message": "failed to set student to active"}), 500
    
    print(res.result())
    return jsonify({"message": "successfully set student to active"}), 200

@app.route('/upload-notes-about-student', methods=["POST"])
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






from big_query.gets import get_all_quizzes
@app.route('/get-all-quizzes', methods=["GET"])
@token_required
def get_all_quizzes_route(user_id):
    quizzes = get_all_quizzes(client=bq_client)

    if not quizzes or len(quizzes)==0:
        return jsonify({"message": "Error retrieving quizzes"}), 500
    
    return jsonify({"quizzes": quizzes}), 200



from big_query.gets import get_quiz_meta_data
@app.route('/get-quiz-meta-data', methods=["POST"])
@token_required
def get_quiz_meta_data_route(user_id):
    data = request.get_json()
    quiz_id = data.get('quiz_id')

    quizzes = get_quiz_meta_data(quiz_id=quiz_id, client=bq_client)

    if not quizzes or len(quizzes)==0:
        return jsonify({"message": "Error retrieving quizzes"}), 500
    
    return jsonify({"quizzes": quizzes}), 200


from big_query.gets import get_quiz

@app.route('/get-quiz', methods=["POST"])
@token_required
def get_quiz_route(user_id):
    data = request.get_json()
    quiz_id = data.get('quiz_id')

    if not quiz_id:
        return jsonify({"message": "Missing quiz id"}), 400
    
    quiz = get_quiz(client=bq_client, quiz_id=quiz_id)

    if not quiz or len(quiz)==0:
        return jsonify({"message": "Error retrieving quiz"}), 500
    
    return jsonify({"quiz": quiz}), 200


from big_query.inserts import insert_quiz_result

@app.route('/submit-quiz', methods=["POST"])
@token_required
def submit_quiz_route(user_id):
    data = request.get_json()
    number_of_corrects :int = data.get('number_of_corrects') or None
    number_of_questions :int = data.get('number_of_questions') or None
    passed: int = data.get('passed_quiz') or None
    quiz_id :str = data.get('quiz_id') or None

    
    if passed==1:
        passed = False
    elif passed==2:
        passed = True
    else:
        passed = None


    if not number_of_corrects or not number_of_questions or passed==None or not quiz_id or not user_id:
        return jsonify({"message": "Missing required fields"}), 400


    try:
        insert_quiz_result(user_id=user_id, quiz_id=quiz_id, passed=passed, number_of_corrects=number_of_corrects, number_of_questions=number_of_questions, client=bq_client)
        return jsonify({"message": "Quiz submitted successfully"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


from big_query.gets import get_quiz_status

@app.route('/get-quiz-status', methods=["GET"])
@token_required
def get_quiz_status_route(user_id):
    if not user_id:
        return jsonify({"message": "User must authenticate"}), 401
    
    try: 
        res = get_quiz_status(client=bq_client, user_id=user_id)

        return jsonify({"quiz_status": res}), 200
    
    except Exception as e:
        print(str(e))
        return jsonify({"message": f"Error getting quiz status {str(e)}"}), 500



from big_query.inserts import insert_quiz
from big_query.gets import is_user_admin

@app.route('/upload-quiz', methods=["POST"])
@token_required
def upload_quiz_route(user_id):

    if not user_id:
        return jsonify({"messsage": "User must authenticate"}), 401
    
    is_admin = is_user_admin(client=bq_client, user_id=user_id)
    if not is_admin:
        return jsonify({"message": "User is not admin"}), 401

    if "image" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["image"]
    mimetype = file.mimetype
    file_extension = mimetypes.guess_extension(mimetype)

    title = request.form.get("title")  
    pass_treshold = request.form.get("pass_treshold")

    if not title or not pass_treshold:
        return jsonify({"error": "Missing fields"}), 400
    

    #temporary storing the image
    temp_filename = f"/tmp/{uuid4()}{file_extension}"
    file.save(temp_filename)


    #inserting the quiz

    try:
        insert_quiz(title=title, image_path=temp_filename, extension=file_extension, pass_treshold=pass_treshold, bq_client=bq_client)
        return jsonify({"message": "Quiz inserted successfully"}), 200

    except Exception as e:
        print(f"Error inserting quiz {e}")
        return jsonify({"message": f"Error inserting quiz: {e}"}), 500









from big_query.inserts import insert_review
from big_query.deletes import delete_review

@app.route('/upload-review', methods=["POST"])
@token_required
def upload_review_route(user_id):
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    rating = data.get('rating')
    comment = data.get('comment')
    name = data.get('name') or "Anonym"

    if not (teacher_user_id and rating and comment):
        return jsonify({"message": "Missing required fields"}), 403

    try:
        delete_review(user_id, teacher_user_id, bq_client)
    except Exception as e:
        raise Exception(f"Error deleting old review: {e}")
    
    try:
        insert_review(student_user_id=user_id, teacher_user_id=teacher_user_id, rating=rating, comment=comment, name=name, bq_client=bq_client)
        return jsonify({"message": "Inserted review succesfully"}), 200
    except Exception as e:
        return jsonify({"message": f"error inserting review {e}"}), 500


from big_query.gets import get_all_reviews
@app.route('/get-all-reviews', methods=["GET"])
def get_all_reviews_route():
    try:
        data = get_all_reviews(client=bq_client)
        return jsonify({"reviews": data}), 200
    except Exception as e:
        return jsonify({"message": f"Error receiving all reviews {e}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))  # Use PORT from the environment or default to 8080
    app.run(debug=True ,host="0.0.0.0", port=port)
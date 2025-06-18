from flask import Flask, request, jsonify
from datetime import datetime
from dotenv import load_dotenv
import os
from flask.sessions import SessionInterface, SessionMixin
from flask_cors import CORS
from dotenv import load_dotenv
import logging
from datetime import timedelta
from uuid import uuid4
from firebase_admin import credentials, initialize_app
from server_routes.config import firestore_client
 
load_dotenv()
app = Flask(__name__)

# Configure logging, environment variables, etc.
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for Flask application")
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=14)
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'enkel_laering_prefix'
app.config['SESSION_COOKIE_NAME'] = 'enkel_laering_coockie'
app.config['SESSION_COOKIE_HTTPONLY'] = True

app.config['SESSION_COOKIE_SECURE'] = True
#app.config['SESSION_COOCKIE_SECURE'] = False

app.config['SESSION_COOKIE_SAMESITE'] = 'None'

#app.config['SESSION_COOKIE_DOMAIN'] = 'enkellaering-service-895641904484.europe-west2.run.app'
app.config['SESSION_COOKIE_DOMAIN'] = 'https://enkellaering-service-prototype-895641904484.europe-west2.run.app'
#app.config['SESSION_COOKIE_DOMAIN'] = 'localhost'


CORS(app, resources={
    r"/*": {
        "origins": [
            "https://new-enkellaering-v2.vercel.app",
            "http://localhost:3000",
            "https://enkellaering.no",
            "https://www.enkellaering.no",
        ]
    }
}, supports_credentials=True)

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


logging.basicConfig(level=logging.INFO)

#URL blueprints for the different files
from server_routes.authentication import auth_bp
from server_routes.teacher import teacher_bp
from server_routes.admin import admin_bp
from server_routes.student import student_bp
from server_routes.classes import classes_bp
from server_routes.review import review_bp
from server_routes.order import order_bp
from server_routes.teacher_images_and_about_me import teacher_images_bp
from server_routes.quiz import quiz_bp
from server_routes.email import mail_bp
from server_routes.job import job_bp


app.register_blueprint(auth_bp, url_prefix="")
app.register_blueprint(teacher_bp, url_prefix="")
app.register_blueprint(admin_bp, url_prefix="")
app.register_blueprint(student_bp, url_prefix="")
app.register_blueprint(classes_bp, url_prefix="")
app.register_blueprint(review_bp, url_prefix="")
app.register_blueprint(order_bp, url_prefix="")
app.register_blueprint(teacher_images_bp, url_prefix="")
app.register_blueprint(quiz_bp, url_prefix="")
app.register_blueprint(mail_bp, url_prefix="")
app.register_blueprint(job_bp, url_prefix="")




from flask.sessions import SessionInterface, SessionMixin
from datetime import datetime, timedelta
from uuid import uuid4
import logging
from server_routes.config import token_required

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
    




if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))  # Use PORT from the environment or default to 8080
    app.run(debug=True ,host="0.0.0.0", port=port)
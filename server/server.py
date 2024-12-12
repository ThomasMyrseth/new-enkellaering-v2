from flask import Flask, request, jsonify, session
from google.cloud import bigquery
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from auth.hash_password import hash_password, check_password

app = Flask(__name__)
PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')









@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    country = data.get('country')

    if not all([email, password, firstname, lastname, country]):
        return jsonify({"error": "All fields are required."}), 400

    password_hash = hash_password(password)

    bq_client = bigquery.Client()

    # Check if user already exists
    query = f"SELECT * FROM `{USERS_TABLE}` WHERE email = @email"
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("email", "STRING", email)]
    )
    results = list(bq_client.query(query, job_config=job_config))

    if results:
        return jsonify({"error": "User already exists."}), 400

    # Insert new user
    query = f"""
        INSERT INTO `{USERS_TABLE}` (email, firstname, lastname, country, password_hash, created_at)
        VALUES (@Email, @Firstname, @Lastname, @Country, @PasswordHash, CURRENT_TIMESTAMP())
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("Email", "STRING", email),
            bigquery.ScalarQueryParameter("Firstname", "STRING", firstname),
            bigquery.ScalarQueryParameter("Lastname", "STRING", lastname),
            bigquery.ScalarQueryParameter("Country", "STRING", country),
            bigquery.ScalarQueryParameter("PasswordHash", "STRING", password_hash),
        ]
    )

    bq_client.query(query, job_config=job_config)
    return jsonify({"message": "User registered successfully."}), 201




@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required."}), 400

    bq_client = bigquery.Client()

    # Fetch user data
    query = f"SELECT user_id, email, password_hash FROM `{USERS_TABLE}` WHERE email = @Email"
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
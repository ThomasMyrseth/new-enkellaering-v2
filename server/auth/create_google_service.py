# Google OAuth2 and API Client Functions

from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from flask import Flask, session, redirect, jsonify
import os
import json
from auth.manage_credentials import store_credentials, get_user_metadata
from google.cloud import bigquery


# Load credentials and define constants
CREDENTIALS_PATH = os.path.abspath('credentials.json')
with open(CREDENTIALS_PATH, 'r') as file:
    credentials_data = json.load(file)['web']

REDIRECT_URI = "http://localhost:8080/server/callback"
from uuid import uuid4

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.metadata",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.file"
]

def create_service(client_secret_file, scopes, bq_client):
    print("logging in, or creating new user ...")
    flow = Flow.from_client_secrets_file(
        client_secret_file,
        scopes=scopes,
        redirect_uri=REDIRECT_URI
    )

    # Get authorization URL and save state to session
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    session['state'] = state

    # Generate a unique session ID and store it in the session
    session_id = str(uuid4())
    session['session_id'] = session_id

    print(f"Session ID generated: {session_id}")


    return redirect(authorization_url)


def exchange_code_for_token(code, api_name, api_version, scopes, bq_client=None):
    print("exchange code for token ...")

    flow = Flow.from_client_secrets_file(
        CREDENTIALS_PATH,
        scopes= SCOPES,
        redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(code=code)

    credentials = flow.credentials

    # Retrieve session_id from session
    session_id = session.get('session_id')
    print("session id", session_id)
    if not session_id:
        return jsonify({'error': 'Session ID not found. Please log in again.'}), 400

    # Fetch user profile
    userinfo_service = build('oauth2', 'v2', credentials=credentials)
    userinfo = userinfo_service.userinfo().get().execute()

    user_id = userinfo['id']  # User's unique Google ID
    email = userinfo.get('email', '')


    # Check if user exists
    print("checking to see if user metadata exists in BQ ...")
    user_metadata = get_user_metadata(user_id=user_id)

    if not user_metadata:
        print(f"New user detected: {user_id}")
        country = userinfo.get('locale', '')  # Can be mapped as the country
        firstname = userinfo.get('given_name', '')
        lastname = userinfo.get('family_name', '')  

        # Create user in the `users` table
        print("inserting new user into BQ")
        create_user(user_id=user_id, firstname=firstname, lastname=lastname, email=email, country=country, bq_client=bq_client)

        user_metadata = {
            "user_id": user_id,
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "country": country,
        }
    else:
        user_metadata = user_metadata[0]  # Use the first result
    
    print("\n\n\n user metadata: ", user_metadata)

    # Save credentials
    credentials_dict = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes,
    }

    print("acces token: ", credentials.token)

    print("storing credentials ...")
    store_credentials(session_id, user_id, credentials_dict)

    print(f"Credentials stored for user {user_id}, session ID: {session_id}")
    next_url = session.pop('next_url', 'http://localhost:3000')
    return redirect(next_url)



def create_user(user_id, firstname, lastname, email, country, bq_client=None):

    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json("google_service_account.json")

    user_table = 'main_embeddings_v1.users'

    # Define the SQL query with placeholders for parameters
    query = f"""
        INSERT INTO `{user_table}` (user_id, firstname, lastname, email, country, created_at)
        VALUES (@user_id, @firstname, @lastname, @email, @country, CURRENT_TIMESTAMP())
    """

    # Define query parameters
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
            bigquery.ScalarQueryParameter("firstname", "STRING", firstname),
            bigquery.ScalarQueryParameter("lastname", "STRING", lastname),
            bigquery.ScalarQueryParameter("email", "STRING", email),
            bigquery.ScalarQueryParameter("country", "STRING", country),
        ]
    )

    # Execute the query
    try:
        bq_client.query(query, job_config=job_config)
        print(f"User {user_id} successfully created in {user_table}.")
    except Exception as e:
        print(f"Error creating user {user_id} in {user_table}: {e}")
        raise
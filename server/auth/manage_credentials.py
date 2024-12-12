from google.cloud import bigquery
from cryptography.fernet import Fernet
import os
import json
from dotenv import load_dotenv
from flask import session

# Initialize the encryption key (store this securely in a config file or environment variable)
load_dotenv()
SECRET_KEY = os.getenv('APP_SECRET')
cipher = Fernet(SECRET_KEY)

credentials_table = "main_embeddings_v1.credentials"

def encrypt(data):
    try:
        return cipher.encrypt(data.encode()).decode()
    except Exception as e:
        print(f"Encryption failed: {e}")
        raise Exception(f"Encryption failed: {e}")

def decrypt(encrypted_data):
    try:
        return cipher.decrypt(encrypted_data.encode()).decode()
    except Exception as e:
        print(f"Decryption failed: {e}")
        raise Exception(f"Decryption failed: {e}")

def store_credentials(session_id, user_id, credentials_dict, bq_client=None):
    print("storing credentials ....")

    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json('google_service_account.json')

    encrypted_credentials = encrypt(json.dumps(credentials_dict))
    rows_to_insert = [
        {
            "session_id": session_id,
            "user_id": user_id,
            "credentials": encrypted_credentials,
        }
    ]
    errors = bq_client.insert_rows_json(credentials_table, rows_to_insert)
    if errors:
        print(f"Failed to store credentials: {errors}")
        raise Exception("BigQuery insert failed")
    print("credentials stored")

def retrieve_credentials(user_id, bq_client=None):
    print("---RETRIEVE CREDENTIALS---")
    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json('google_service_account.json')

    query = f"""
    SELECT credentials FROM `{credentials_table}`
    WHERE user_id = @user_id
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    try:
        query_job = bq_client.query(query, job_config=job_config)
        results = list(query_job.result())
        if results:
            encrypted_credentials = results[0]["credentials"]
            return json.loads(decrypt(encrypted_credentials))
        print(f"No credentials found for user_id: {user_id}")
        return None
    except Exception as e:
        print(f"Error retrieving credentials: {e}")
        raise Exception(f"Error retrieving credentials: {e}")


def get_all_users_credentials(bq_client=None):

    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json('google_service_account.json')

    query = f"""
    SELECT user_id, session_id, credentials FROM `{credentials_table}`
    """
    try:
        # Execute the query
        query_job = bq_client.query(query)
        results = list(query_job.result())
        
        if not results:
            print("No credentials found in the table.")
            return []

        # Decrypt and parse credentials
        decrypted_users = []
        for row in results:
            try:
                decrypted_credentials = json.loads(decrypt(row["credentials"]))
                decrypted_users.append({
                    "user_id": row["user_id"],
                    "session_id": row["session_id"],
                    "credentials": decrypted_credentials,
                })
            except Exception as e:
                print(f"Error decrypting credentials for user_id {row['user_id']}: {e}")
                continue  # Skip this user if decryption fails
    
        return decrypted_users

    except Exception as e:
        print(f"Error retrieving credentials: {e}")
        raise Exception(f"Error retrieving credentials: {e}")

def delete_credentials(user_id, bq_client=None):
    print(f"Deleting credentials for user {user_id}")

    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json('google_service_account.json')


    query = f"""
    DELETE FROM `{credentials_table}`
    WHERE user_id = @user_id
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    try:
        bq_client.query(query, job_config=job_config)
    except Exception as e:
        print(f"Error deleting credentials for user_id {user_id}: {e}")
        raise Exception(f"Error deleting credentials for user_id {user_id}: {e}")

def cleanup_expired_credentials(days=7, bq_client=None):
    query = f"""
    DELETE FROM `{credentials_table}`
    WHERE TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), created_at, DAY) > @days
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("days", "INT64", days),
        ]
    )
    try:
        bq_client.query(query, job_config=job_config)
    except Exception as e:
        print(f"Error cleaning up expired credentials: {e}")
        raise Exception(f"Error cleaning up expired credentials: {e}")


def get_user_data_from_session(session_id=None, bq_client=None):
    print("---GET USER DATA FROM SESSION---")
    if session_id==None:
        session_id = session.get('session_id')
    if not session_id or session_id=="":
        raise Exception("session ID not found! session_id: ", session_id)
    
    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json("google_service_account.json")

    query = f"""
    SELECT user_id, credentials
    FROM `{credentials_table}`
    WHERE session_id = @session_id
    ORDER BY created_at DESC
    LIMIT 1
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("session_id", "STRING", session_id),
        ]
    )

    try:
        query_job = bq_client.query(query, job_config=job_config)
        results = list(query_job.result())
        if results:
            encrypted_credentials = results[0]['credentials']
            user_data = {
                "user_id": results[0]['user_id'],
                "credentials": json.loads(decrypt(encrypted_credentials)),
            }
            return user_data
    except Exception as e:
        print(f"Error retrieving user data for session_id {session_id}: {e}")
        raise Exception(f"Error retrieveinf user data from session id: {session_id} ")

def refresh_credentials(user_id: str, session_id :str, bq_client=None):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    """
    Refreshes the user's credentials if they are expired.
    """

    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json('google_service_account.json')


    # Retrieve the stored credentials
    credentials_dict = retrieve_credentials(user_id)
    if not credentials_dict:
        raise Exception("No credentials found for the user.")

    # Reconstruct the credentials object
    credentials = Credentials(**credentials_dict)

    # Check if credentials are expired and refresh them
    if credentials.expired and credentials.refresh_token:
        try:
            credentials.refresh(Request())

            # Update the credentials in BigQuery after refreshing
            updated_credentials = {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes,
            }

            #delete old credentials
            delete_credentials(user_id=user_id, bq_client=bq_client)
            #store new credentials
            store_credentials(session_id, user_id, updated_credentials, bq_client=bq_client)
            print("Credentials successfully refreshed and updated.")
            return updated_credentials
        except Exception as e:
            print(f"Failed to refresh credentials: {e}")
            raise Exception(f"Failed to refresh credentials for user {user_id}, error: {e}")
    else:
        print("Credentials are valid and do not require a refresh.")
        return credentials_dict

def get_user_metadata(user_id, bq_client=None):
    users_table = 'main_embeddings_v1.users'

    if not bq_client:
        bq_client = bigquery.Client.from_service_account_json('google_service_account.json')


    query = f"""
    SELECT * FROM `{users_table}`
    WHERE user_id = @user_id
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    try:
        # Execute the query
        query_job = bq_client.query(query, job_config=job_config)
        results = list(query_job.result())
        # Parse and return results
        if results:
            return results[0]  # Convert rows to dictionaries
        else:
            print(f"No metadata found for user_id: {user_id}")
            return None
    except Exception as e:
        print(f"Error retrieving user metadata for user_id {user_id}: {e}")
        raise Exception(f"Error retrieving user metadata for user_id {user_id}: {e}")
import os
from datetime import datetime, timedelta, timezone
from flask import request, jsonify
import logging
from functools import wraps
import jwt
from google.cloud import firestore


SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_super_secret_key')
firestore_client = firestore.Client(project='enkel-laering')

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


TASKS_INVOKER_SA = os.getenv("TASKS_INVOKER_SA", "")
SERVICE_URL = os.getenv("SERVICE_URL", "")


def verify_cloud_tasks_oidc(f):
    """Verifies the OIDC token Cloud Tasks attaches to its HTTP task requests."""
    @wraps(f)
    def decorated(*args, **kwargs):
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        auth_header = request.headers.get('Authorization', '')
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            logging.warning("Cloud Tasks OIDC token missing from request.")
            return jsonify({'error': 'Unauthorized'}), 401

        token = parts[1]
        try:
            claims = id_token.verify_oauth2_token(
                token, google_requests.Request(), audience=SERVICE_URL
            )
        except Exception as e:
            logging.warning(f"Invalid Cloud Tasks OIDC token: {e}")
            return jsonify({'error': 'Unauthorized'}), 401

        if claims.get('email') != TASKS_INVOKER_SA or not claims.get('email_verified'):
            logging.warning(f"Unexpected Cloud Tasks OIDC token issuer: {claims.get('email')}")
            return jsonify({'error': 'Unauthorized'}), 401

        return f(*args, **kwargs)

    return decorated


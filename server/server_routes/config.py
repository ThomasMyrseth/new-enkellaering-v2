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


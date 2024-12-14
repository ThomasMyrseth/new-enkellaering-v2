from firebase_admin import auth

def verify_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # Contains user info
    except Exception as e:
        print("Error verifying token:", e)
        return None
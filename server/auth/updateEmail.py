import firebase_admin
from firebase_admin import credentials, auth

"""
Supabase client initialization.
This module provides a singleton Supabase client instance for the application.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validate required environment variables
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is not set")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")

# Initialize Supabase client (singleton)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# ==========================
# CONFIG
# ==========================

SERVICE_ACCOUNT_PATH = "key.json"  # <-- adjust

EMAIL_UPDATES = [
    {
        "old_email": "thomas.myrseth@hotmail.com",
        "new_email": "thomas@enkellaering.no",
    },
    {
        "old_email": "karstennieuwenhuize@gmail.com",
        "new_email": "karsten@enkellaering.no",
    }
]

# ==========================
# INIT FIREBASE
# ==========================

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# ==========================
# HELPERS
# ==========================

def get_teacher_by_user_id(user_id: str):
    """Fetch teacher row from Supabase"""
    response = (
        supabase
        .table("teachers")
        .select("user_id, email")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return response.data

def update_teacher_email_supabase(user_id: str, new_email: str):
    """Update email in teachers table"""
    supabase.table("teachers") \
        .update({"email": new_email}) \
        .eq("user_id", user_id) \
        .execute()

# ==========================
# MAIN LOGIC
# ==========================

for item in EMAIL_UPDATES:
    old_email = item["old_email"]
    new_email = item["new_email"]

    print("\n--------------------------------------")
    print(f"Processing: {old_email} → {new_email}")

    try:
        # 1. Get Firebase user
        user = auth.get_user_by_email(old_email)
        uid = user.uid
        print(f"✔ Firebase user found (uid={uid})")

        # 2. Verify teacher exists in Supabase
        teacher = get_teacher_by_user_id(uid)
        if not teacher:
            raise Exception("User exists in Firebase but NOT in teachers table")

        print(f"✔ Teacher row found in Supabase (email={teacher['email']})")

        # 3. Update Firebase Auth
        auth.update_user(
            uid,
            email=new_email,
            email_verified=True
        )
        print("✔ Firebase Auth email updated")

        # 4. Update Supabase
        update_teacher_email_supabase(uid, new_email)
        print("✔ Supabase teachers.email updated")

        print(f"✅ SUCCESS for uid={uid}")

    except auth.UserNotFoundError:
        print(f"❌ Firebase user not found for email: {old_email}")

    except Exception as e:
        print(f"❌ FAILED for {old_email}: {e}")

print("\nDone.")


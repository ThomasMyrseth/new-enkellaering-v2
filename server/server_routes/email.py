import os
from flask import Blueprint, jsonify
from dotenv import load_dotenv

import resend
from typing import List
load_dotenv()

mail_bp = Blueprint('mail', __name__)

# This route builds and sends the email dynamically on request
@mail_bp.route('/send-hello-email', methods=['GET'])
def send_hello_email_route():
    try:
        resend.api_key = os.environ.get('RESEND_API_KEY')

        params: resend.Emails.SendParams = {
            "from": "Enkel Læring <kontakt@enkellaering.no>",
            "to": ["thomas.myrseth@hotmail.com", "thomas@myrsethmedia.no"],
            "subject": "Velkommen til Enkel Læring",
            "html": "<h1>it works!</h1> <br/> <p>Jeg liker banenenr </p>",
        }

        email = resend.Emails.send(params)
        print("✅ Email sent:", email)

        return jsonify({"message": "Email has been sent"}), 200

    except Exception as e:
        print("❌ Failed to send email:", e)
        return jsonify({"error": str(e)}), 500
    

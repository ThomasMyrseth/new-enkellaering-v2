from flask import Blueprint, request, jsonify
import logging
from supabase_client import supabase
import resend
import os
import time

resend.api_key = os.getenv('RESEND_API_KEY')
FROM_EMAIL = os.getenv("MAIL_USERNAME") or "Enkel Laering <kontakt@enkellaering.no>"

waitlist_bp = Blueprint('waitlist', __name__)

@waitlist_bp.route('/submit-waitlist', methods=['POST'])
def submit_waitlist():
    """Public endpoint to add email and phone to waitlist for gratis leksehjelp notifications"""
    data = request.get_json() or {}
    
    # Validate required fields
    email = data.get('email')
    phone = data.get('phone')

    if not email:
        return jsonify({"error": "Email er påkrevd"}), 400
    
    if not phone:
        return jsonify({"error": "Telefonnummer er påkrevd"}), 400

    # Basic email validation
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Ugyldig e-postadresse"}), 400
    
    try:
        # Insert email and phone into waitlist table
        # Supabase will handle duplicate emails via UNIQUE constraint
        response = supabase.table('waitlist').insert({
            'email': email.lower().strip(),
            'phone': phone.strip()
        }).execute()
        
        logging.info(f"Successfully added {email} to waitlist")
        return jsonify({
            "message": "Takk! Du vil få beskjed når neste økt er klar.",
            "email": email
        }), 201
        
    except Exception as e:
        # Check if it's a duplicate email error
        error_message = str(e)
        if 'duplicate key value violates unique constraint' in error_message.lower() or 'unique' in error_message.lower():
            logging.info(f"Email {email} already in waitlist")
            # Return success to user anyway (don't reveal if email exists)
            return jsonify({
                "message": "Takk! Du vil få beskjed når neste økt er klar.",
                "email": email
            }), 200
        
        # Log the actual error but don't expose details to user
        logging.exception(f"Failed to add email to waitlist: {email}")
        return jsonify({"error": "Noe gikk galt. Prøv igjen senere."}), 500

@waitlist_bp.route('/send-waitlist-email', methods=['POST', 'GET'])
def send_waitlist_email():
    """Unauthenticated endpoint to send an email template to all waitlisted users."""
    try:
        # Get parameters either from JSON body or URL query
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = request.args
            
        next_date = data.get('next_date')
        time_str = data.get('time')
        
        if not next_date or not time_str:
            return jsonify({"error": "Missing 'next_date' or 'time' parameter"}), 400
            
        # Get all users on the waitlist
        response = supabase.table('waitlist').select('email').execute()
        waitlist_users = response.data
        
        if not waitlist_users:
            return jsonify({"message": "No users found in the waitlist"}), 200
            
        emails = [user['email'] for user in waitlist_users if user.get('email')]
        
        # Construct email HTML
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>Påminnelse: Gratis leksehjelp!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="font-size: 16px;">Hei!</p>
                <p style="color: #555;">Dette er en oppdatering til deg som står på ventelisten for gratis leksehjelp.</p>
                <p style="color: #555;">Neste gratis leksehjelp er <strong>{next_date}</strong>, klokken <strong>{time_str}</strong>.</p>
                <p style="color: #555;">Dette er et gratis tilbud. Møt opp, og få hjelp med det du måtte lure på. Førstemann til mølla!</p>
                <a href="https://enkellaering.no/gratis-hjelp" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Meld deg på her</a>
            </div>
        </div>
        """
        
        # API key could also be re-initialized if needed
        resend.api_key = os.getenv('RESEND_API_KEY')
        
        successful = 0
        for email in emails:
            try:
                resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": email,
                    "subject": "Snart er det gratis leksehjelp!",
                    "html": html_content
                })
                time.sleep(2)
                successful += 1
            except Exception as e:
                logging.error(f"Failed to send waitlist email to {email}: {e}")
                
        return jsonify({
            "message": "Emails sent successfully",
            "total_waitlist_users": len(emails),
            "emails": emails,
            "successfully_sent": successful
        }), 200
        
    except Exception as e:
        logging.exception("Error in send_waitlist_email endpoint")
        return jsonify({"error": str(e)}), 500


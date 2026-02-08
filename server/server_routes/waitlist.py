from flask import Blueprint, request, jsonify
import logging
from supabase_client import supabase

waitlist_bp = Blueprint('waitlist', __name__)

@waitlist_bp.route('/submit-waitlist', methods=['POST'])
def submit_waitlist():
    """Public endpoint to add email to waitlist for gratis leksehjelp notifications"""
    data = request.get_json() or {}
    
    # Validate email is provided
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email er påkrevd"}), 400
    
    # Basic email validation
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Ugyldig e-postadresse"}), 400
    
    try:
        # Insert email into waitlist table
        # Supabase will handle duplicate emails via UNIQUE constraint
        response = supabase.table('waitlist').insert({
            'email': email.lower().strip()  # Normalize email
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

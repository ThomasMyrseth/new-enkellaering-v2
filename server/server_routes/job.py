import os
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
import resend
load_dotenv()
import logging

resend.api_key = os.getenv('RESEND_API_KEY')
FROM_EMAIL = os.getenv("MAIL_USERNAME") or "kontakt@enkellaering.no"


job_bp = Blueprint('job', __name__)

from cloud_sql.inserts import insertJobApplication, uploadRecumeToStorage
@job_bp.route('/upload-job-application', methods=['POST'])
def uploadJobApplicationRoute():
    firstname = request.form.get("firstname")
    lastname = request.form.get("lastname")
    email = request.form.get("email")
    phone = request.form.get("phone")
    subject = request.form.get("subject")
    grades = request.form.get("grades")
    resume_file = request.files.get("resume")

    if not all([firstname, lastname, email, phone, subject, resume_file]):
        return jsonify({"error": "All fields are required"}), 400

    
    #upload to cloud storage, retrieve the public url and insert into database
    try:
        public_url = uploadRecumeToStorage(
            resume_file.read(),
            resume_file.filename,
            firstname,
            lastname,
            resume_file.mimetype
        )
    except Exception as e:
        logging.error(f"Error uploading resume to bucket: {e}")
        return jsonify({"error": "Failed to process application"}), 500
    
    try:
        insertJobApplication(firstname, lastname, email, phone, public_url, grades, subject)
    except Exception as e:
        logging.error(f"Error inserting job application into database: {e}")
        return jsonify({"error": "Failed to save application"}), 500

    


    try:
        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": [email],
            "subject": f"Takk for din jobbsøknad, {firstname}!",
            "html": f"""
                <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
                    <h1>Hei {firstname}!</h1>
                    <h2>Takk for din jobbsøknad hos Enkel Læring</h2>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <p style="color: #555;">
                            Vi har mottatt din søknad og vil vurdere den snarlig. Du vil høre fra oss innen kort tid.
                            <br/><br/>
                            Har du spørsmål i mellomtiden, kontakt oss gjerne på <a href="mailto:kontakt@enkellaering.no">kontakt@enkellaering.no</a>.
                        </p>
                        <a href="https://enkellaering.no" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Besøk Enkel Læring</a>
                    </div>
                </div>
                """
        }
        response = resend.Emails.send(params)
        logging.info(f"Email to job aplicant sent successfully: {response}")
    except Exception as e:
        logging.error(f"Error sending email to job applicant: {e}")
        return jsonify({"error": "Failed to send application"}), 500
    
    try:
        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": ["thomas.myrseth@hotmail.com", "karolinenagyaasheim@gmail.com"],
            "subject": f"Ny jobbsøknad fra {firstname} {lastname}",
            "html": f"""
                <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
                    <h1>Ny jobbsøknad mottatt</h1>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <p style="color: #555;">
                            Du har mottatt en ny jobbsøknad fra {firstname} {lastname}.
                            <br/><br/>
                            E-post: {email}<br/>
                            Telefon: {phone}<br/>
                            Emne: {subject}<br/>
                            Snitt: {grades}<br/>
                            <a href="{public_url}" target="_blank">Se vedlagt CV</a>
                        </p>
                    </div>
                </div>
                """
        }
        response = resend.Emails.send(params)
        logging.info(f"Email to admin about job application sent successfully: {response}")
    except Exception as e:
        logging.error(f"Error sending email to admin about job application: {e}")
        return jsonify({"error": "Failed to notify admin"}), 500

    return jsonify({"message": "Application received"}), 200
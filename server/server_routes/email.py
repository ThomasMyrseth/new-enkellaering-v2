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


def sendNewStudentToTeacherMail(receipientTeacherMail: str, teacherName :str):
    try:
        # Ensure the API key is set
        resend.api_key = os.environ.get('RESEND_API_KEY')
        TEMPLATE_ID = os.environ.get('NEWSTUDENT_FOR_TEACHER_TEMPLATE_ID')

        # Build the email parameters using the provided student name and teacher's email
        params = {
            "template_id": TEMPLATE_ID,  # Replace with your actual template ID
            "to": [{
                "email": receipientTeacherMail,
                "name": teacherName  # You can modify this if you want to dynamically pass the teacher's name
            }],
            "variables": [
                {
                    "email": receipientTeacherMail,
                }
            ]
        }

        # Send the email using the Resend API
        email = resend.Emails.send(params)
        print("✅ Email sent:", email)
        return email  # Optionally, you can return a success message or the email object

    except Exception as e:
        print("❌ Failed to send email:", e)
        # Depending on your application's design, you might want to re-raise the exception or return an error message.
        raise e
    

def sendAcceptOrRejectToStudentMail(studentName :str, teacherName :str, acceptOrReject :bool, receipientStudentMail :str):
    try:
        # Ensure the API key is set
        resend.api_key = os.environ.get('RESEND_API_KEY')
        TEMPLATE_ID = os.environ.get('TEACHER_ACCEPTED_YOU_FOR_STUDENT_TEMPLATE_ID')
        
        accept = 'godkjent' if acceptOrReject else 'avslått'
        # Build the email parameters using the provided student name and teacher's email
        params = {
            "template_id": TEMPLATE_ID,  # Replace with your actual template ID
            "to": [{
                "email": receipientStudentMail,
                "name": studentName  # You can modify this if you want to dynamically pass the teacher's name
            }],
            "variables": [
                {
                    "email": receipientStudentMail,
                    "substitutions": [
                        {
                            "var": "teacherName",
                            "value": teacherName
                        },
                        {
                            "var": "studentName",
                            "value": studentName
                        },
                        {
                            "var": "acceptOrReject",
                            "value": accept
                        }
                    ]
                }
            ]
        }

        # Send the email using the Resend API
        email = resend.Emails.send(params)
        print("✅ Email sent:", email)
        return email  # Optionally, you can return a success message or the email object

    except Exception as e:
        print("❌ Failed to send email:", e)
        # Depending on your application's design, you might want to re-raise the exception or return an error message.
        raise e
    

def sendNewStudentToAdminMail(newStudentPhone: str):

    #get the admin emais
    try:
        admins = get_all_admins()
        emails = []
        for admin in admins:
            emails.append(admin['email'])

    except Exception as e:
        raise RuntimeError(f"Error getting the email of admins: {e}")

    try:
        resend.api_key = os.environ.get('RESEND_API_KEY')
        TEMPLATE_ID = os.environ.get('NEW_STUDENT_FOR_ADMIN_TEMPLATE_ID')  # Set this in your .env

        # Build the variables for each recipient
        variables = [
            {
                "email": email,
                "substitutions": [
                    { "var": "newStudentPhone", "value": newStudentPhone }
                ]
            }
            for email in receipientMails
        ]

        params = {
            "template_id": TEMPLATE_ID,
            "to": [{"email": email, "name": "Admin"} for email in receipientMails],
            "variables": variables
        }

        email = resend.Emails.send(params)
        print("✅ Email sent:", email)
        return email

    except Exception as e:
        print("❌ Failed to send admin email:", e)
        raise e
    




import locale
def format_last_class_date(date_str, language="no"):
    try:
        # Parse the ISO date/datetime string
        dt = datetime.fromisoformat(date_str)
    except Exception as e:
        return date_str  # Fallback to the raw string if parsing fails

    # Set locale based on language preference
    if language == "no":
        try:
            locale.setlocale(locale.LC_TIME, 'nb_NO.UTF-8')
        except locale.Error:
            # Fallback in case the Norwegian locale is not installed
            locale.setlocale(locale.LC_TIME, 'en_US.UTF-8')
    else:
        locale.setlocale(locale.LC_TIME, 'en_US.UTF-8')

    # Format the date nicely (example: "torsdag 27. mars 2025, kl. 16:30")
    formatted = dt.strftime("%A %d. %B %Y, kl. %H:%M")
    return formatted


from big_query.gets import get_students_with_few_classes, get_all_admins
from big_query.bq_types import Teacher
from datetime import datetime
@mail_bp.route('/send-email-about-inactive-students-to-admin', methods=['GET'])
def sendInactiveStudentsMailToAdmin ():

    #get all the students that have not had any classes in the last two weeks
    try:
        students = get_students_with_few_classes(days=14)
    except Exception as e:
        print(e)
        return jsonify({"message": f"Error getting students with few classes: {e}"}), 500
    

    #get all the admins
    try:
        admins :List[Teacher] = get_all_admins()
    except Exception as e:
        print(e)
        return jsonify({"message": f"Error getting the admins emails: {e}"})
    

    #make the email
    try:
        resend.api_key = os.environ.get('RESEND_API_KEY')

        html = f"""
            <h1>Disse elevene har hatt få timer de siste to ukene</h1>
            <p>*viser kun elever som er satt som aktive</p>
            <br/>
        """

        

        for student in students:
            if student.get('last_class_started_at'):
                try:
                    last_class_val = student['last_class_started_at']
                    # Check if the value is a string. If it is, parse it.
                    if isinstance(last_class_val, str):
                        last_class_dt = datetime.fromisoformat(last_class_val)
                    # If the value already has an isoformat() method (like a datetime or pandas Timestamp), use it directly.
                    elif hasattr(last_class_val, 'isoformat'):
                        last_class_dt = last_class_val
                    else:
                        # Otherwise, convert to string and then parse.
                        last_class_dt = datetime.fromisoformat(str(last_class_val))
                    
                    # Format the date to display only the date part (YYYY-MM-DD)
                    formatted_date = last_class_dt.strftime('%Y-%m-%d')
                    # Get the current time using the same timezone if available
                    now = datetime.now(last_class_dt.tzinfo) if last_class_dt.tzinfo else datetime.today()
                    days_ago = (now - last_class_dt).days
                except Exception as e:
                    print("Error processing last_class_started_at:", e)
                    formatted_date = "N/A"
                    days_ago = "N/A"
            else:
                formatted_date = "N/A"
                days_ago = "N/A"
            
            html += f""" 
                <ul>
                    {student['firstname_parent']} {student['lastname_parent']}
                    <br/>
                    Tlf: <span style="font-weight: bold;">{student['phone_parent']}</span>
                    <br/>
                    Lærer: {student['firstname']} {student['lastname']}
                    <span style="font-weight: bold;">{student['phone']}</span>
                    <br/>
                    Siste time var den: {formatted_date}, dette er <span style="font-weight: bold;">{days_ago}</span> dager siden
                </ul>
            """




        params: resend.Emails.SendParams = {
            "from": "Enkel Læring <kontakt@enkellaering.no>",
            "to": [admin['email'] for admin in admins],
            "subject": "Elever med få timer",
            "html": html
        }

        email = resend.Emails.send(params)
        print("✅ Email sent: ", email)

        return jsonify({"message": "Email has been sent"}), 200

    except Exception as e:
        print("❌ Failed to send email:", e)
        return jsonify({"error": str(e)}), 500
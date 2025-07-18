import os
from flask import Blueprint, jsonify
from dotenv import load_dotenv
import resend
from typing import List
load_dotenv()
import logging
from zoneinfo import ZoneInfo
from datetime import datetime
from babel.dates import format_datetime

from cloud_sql.gets import get_students_with_few_classes, get_all_admins

resend.api_key = os.getenv('RESEND_API_KEY')
FROM_EMAIL = os.getenv("MAIL_USERNAME") or "kontakt@enkellaering.no"


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




def sendNewStudentToTeacherMail(receipientTeacherMail: str, teachername :str):
    try:
        # HTML content adapted from your image template
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>Hei {teachername}!</h1>
            <h2>Du har fått en ny elev</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="font-size: 16px;"><strong>En ny elev ønsker hjelp av deg!</strong></p>
                <p style="color: #555;">Logg inn på Enkel Læring for å godkjenne eller avslå eleven</p>
                <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
            </div>
        </div>
        """

        # Send email with Resend
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": receipientTeacherMail,
            "subject": "Du har fått en ny elev",
            "html": html_content
        })

        print("✅ Email sent:", response)
        return response

    except Exception as e:
        print("❌ Failed to send email:", e)
        raise e



def welcomeNewStudentEmailToStudent(parentEmail: str, parentName :str):
    try:
        # HTML content adapted from your image template
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>Hei {parentName}!</h1>
            <h2>Velkommen til Enkel Læring</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="color: #555;">
                    Takk for at du registrerte deg på Enkel Læring! Vi er glade for å ha deg med.
                    Vi minner om at du kan logge inn på Min Side for å se dine timer, kontaktinformasjon til din lærer, samt annen viktig informasjon. 
                    Vi anbefaler at du regelmessig tar en titt på Min Side for å holde deg oppdatert.
                </p>
                <a href="https://enkellaering.no/login" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
            </div>
        </div>
        """

        # Send email with Resend
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": parentEmail,
            "subject": "Informasjon: velkommen til Enkel Læring",
            "html": html_content
        })

        print("✅ Email sent:", response)
        return response

    except Exception as e:
        logging.error(f"❌ Failed to send email to {parentEmail}: {e}")
        print("❌ Failed to send email:", e)
        raise e


def sendSingupTeacherEmailToTeacher(receipientTeacherMail: str, teachername :str):
    try:
        # HTML content adapted from your image template
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>Hei {teachername}!</h1>
            <h2>Velkommen til Enkel Læring</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="color: #555;">
                    For å få elever er du nødt til å skrive litt om deg selv, legge inn et bilde, samt bestå quizzene i dine fag.
                    Dette må du gjøre nederst fra min-side-laerer. Husk også å velge om du ønsker fysiske eller digitale elever.
                    Når du utfører quizzene anbefaler vi deg at du er på PC.
                    <br/>
                    Dersom du har problemer kan du kontakte oss for hjelp med kontaktinfoen under:
                    <br/>
                    <strong>Thomas Myrseth, telefon: 47 18 47 44</strong>
                    <strong>Karoline Aasheim, telefon: 90 65 69 69</strong>
                </p>
                <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
            </div>
        </div>
        """

        # Send email with Resend
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": receipientTeacherMail,
            "subject": "Velkommen til Enkel Læring",
            "html": html_content
        })

        print("✅ Email sent:", response)
        return response

    except Exception as e:
        print("❌ Failed to send email:", e)
        raise e

def sendNewClassToStudentMail(studentName: str, teacherName: str, parentName :str, comment :str, classDate: str, receipientStudentMail: str):
    try:
        try:
            # Parse ISO string with 'Z' suffix as UTC
            dt = datetime.fromisoformat(classDate.replace('Z', '+00:00'))
            # Convert to Europe/Oslo timezone
            local_zone = ZoneInfo("Europe/Oslo")
            dt = dt.astimezone(local_zone)
        except Exception:
            formatted_classDate = classDate  # Fallback to raw string on parse failure
        else:
            # Format using Babel in Norwegian ("nb"); fallback to ISO-like string on failure
            try:
                formatted_classDate = format_datetime(
                    dt,
                    "EEEE dd. MMMM yyyy, 'kl.' HH:mm",
                    locale="nb"
                )
            except Exception:
                formatted_classDate = dt.strftime("%Y-%m-%d %H:%M %Z")
        # HTML email body, adapted to your template
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>{studentName} har akkurat hatt en time</h1>
            <br/>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="font-size: 16px;"><strong>Hei {parentName}.</strong></p>
                <br/>
                <p>{studentName} har hatt en time med {teacherName} {formatted_classDate}.</p>
                <p>Kommentar fra lærer: <br/><strong>{comment}</strong></p>
                <br/>
                <p>Du kan se flere timer og kontakt info til din lærer på <a href='https://enkellaering.no/min-side'>Min Side</a>.
                Ta gjerne kontakt om du lurer på noe eller ønsker en oppfølging fra læreren din!</p>
                <a href="https://enkellaering.no/login" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Gå til Min Side</a>
            </div>
        </div>
        """

        # Send the email
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": receipientStudentMail,
            "subject": f"{studentName} har hatt en time med {teacherName}",
            "html": html_content
        })

        print("✅ Email sent:", response)
        return response

    except Exception as e:
        print("❌ Failed to send email:", e)
        raise e




def sendAcceptOrRejectToStudentMail(studentName: str, teacherName: str, acceptOrReject: bool, receipientStudentMail: str):
    try:
        accept_text = 'godkjent' if acceptOrReject else 'avslått'

        # HTML email body, adapted to your template
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>{teacherName} har {accept_text} deg som elev.</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="font-size: 16px;"><strong>Hei {studentName}.</strong></p>
                <p>{teacherName} har nå {accept_text} søknaden din om å være din lærer.</p>

                {"<p>Dersom " + teacherName + " godtok vil hen kontakte dere per telefon i løpet av kort tid. Vi ber dere i så fall om å kansellere eventuelle andre bestillinger. Dette kan gjøres fra Min Side.</p>" if acceptOrReject else ""}
                
                {"<p>Dersom " + teacherName + " ikke godtok forespørselen deres kan dere forespørre en ny lærer på <a href='https://enkellaering.no/bestill'>enkellaering.no/bestill</a></p>" if not acceptOrReject else ""}
                
                <a href="https://enkellaering.no/login" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Gå til Min Side</a>
            </div>
        </div>
        """

        # Send the email
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": receipientStudentMail,
            "subject": f"{teacherName} har {accept_text} deg som elev",
            "html": html_content
        })

        print("✅ Email sent:", response)
        return response

    except Exception as e:
        print("❌ Failed to send email:", e)
        raise e

import os
import resend


def sendNewStudentToAdminMail(newStudentPhone: str):
    try:
        admins = get_all_admins()
        emails = [admin['email'] for admin in admins]
    except Exception as e:
        raise RuntimeError(f"Error getting the email of admins: {e}")


    # Email content (HTML)
    html_content = f"""
    <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
      <h1>En ny elev la igjen nummeret sitt på nettsiden!</h1>
      <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p style="font-size: 16px;"><strong>{newStudentPhone}</strong> la igjen nummeret sitt.</p>
        <p style="color: #555;">Logg inn på <code>/admin</code> for å følge opp eleven.</p>
        <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
      </div>
    </div>
    """

    # Send individually (Resend doesn't support per-user vars in batch)
    for email in emails:
        try:
            print("sending from: ", FROM_EMAIL)
            response = resend.Emails.send({
                "from": FROM_EMAIL,
                "to": email,
                "subject": "Ny elev har registrert seg",
                "html": html_content
            })
            print(f"✅ Email sent to {email}")
        except Exception as e:
            print(f"❌ Failed to send to {email}: {e}")
            raise e


import locale
from datetime import datetime
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
        admins :List = get_all_admins()
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
    


def sendNewOrderEmailToAdmin( firstname_parent:str, lastname_parent:str, phone_parent:str, teacher_firstname :str, teacher_lastname :str, teacher_phone :str):
    try:
        admins = get_all_admins()
        emails = [admin['email'] for admin in admins]
    except Exception as e:
        raise RuntimeError(f"Error getting the email of admins: {e}")


    # Email content (HTML)
    html_content = f"""
    <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
        <h1>{firstname_parent} {lastname_parent} bestilte {teacher_firstname} {teacher_lastname}</h1>
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;">Info om elev:
            <br/>
            Navn forelder: {firstname_parent} {lastname_parent}
            <br/>
            Telefon forelder: {phone_parent}
            </p>
        </div>

        <br/>

        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;">Info om lærer:
            <br/>
            Navn lærer: {teacher_firstname} {teacher_lastname}
            <br/>
            Telefon lærer: {teacher_phone}
            </p>
        </div>

        <br/>

        <p style="color: #555;">Logg inn på <code>/admin</code> for å følge opp eleven.</p>
        <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
      </div>
    </div>
    """

    # Send individually (Resend doesn't support per-user vars in batch)
    for email in emails:
        try:
            response = resend.Emails.send({
                "from": FROM_EMAIL,
                "to": email,
                "subject": "Ny elev har bestilt en lærer",
                "html": html_content
            })
            print(f"✅ Email sent to {email}")
        except Exception as e:
            print(f"❌ Failed to send to {email}: {e}")
            raise e

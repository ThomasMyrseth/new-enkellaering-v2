import os
from flask import Blueprint, jsonify
from dotenv import load_dotenv
import resend
from typing import List
load_dotenv()
import logging
from zoneinfo import ZoneInfo
from datetime import datetime, time
from babel.dates import format_datetime

from db.gets import get_students_with_few_classes, get_all_admins

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

def sendNewClassToTeacherMail(teacherName: str, studentNames: str, startedAt: str, endedAt: str, comment: str, recipientTeacherEmail: str, groupClass: bool = False, numberOfStudents: int = 1):
    """
    Send confirmation email to teacher after they upload a new class.

    Args:
        teacherName: Name of the teacher
        studentNames: Name(s) of the student(s) - comma separated if multiple
        startedAt: ISO datetime string when class started
        endedAt: ISO datetime string when class ended
        comment: Teacher's comment about the class
        recipientTeacherEmail: Teacher's email address
        groupClass: Whether this was a group class
        numberOfStudents: Number of students in the class
    """
    try:
        # Parse and format start date
        try:
            start_dt = datetime.fromisoformat(startedAt.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(endedAt.replace('Z', '+00:00'))

            # Convert to Europe/Oslo timezone
            local_zone = ZoneInfo("Europe/Oslo")
            start_dt = start_dt.astimezone(local_zone)
            end_dt = end_dt.astimezone(local_zone)

            # Calculate duration
            duration_seconds = (end_dt - start_dt).total_seconds()
            hours = int(duration_seconds // 3600)
            minutes = int((duration_seconds % 3600) // 60)

            # Format duration in Norwegian
            if hours > 0 and minutes > 0:
                duration_text = f"{hours} time{'r' if hours > 1 else ''} og {minutes} minutter"
            elif hours > 0:
                duration_text = f"{hours} time{'r' if hours > 1 else ''}"
            else:
                duration_text = f"{minutes} minutter"

        except Exception:
            formatted_startDate = startedAt  # Fallback
            duration_text = "Ukjent varighet"
        else:
            # Format using Babel in Norwegian
            try:
                formatted_startDate = format_datetime(
                    start_dt,
                    "EEEE dd. MMMM yyyy, 'kl.' HH:mm",
                    locale="nb"
                )
            except Exception:
                formatted_startDate = start_dt.strftime("%Y-%m-%d %H:%M %Z")

        # Build student info text
        if groupClass and numberOfStudents > 1:
            student_info = f"gruppetime med {numberOfStudents} elever ({studentNames})"
        else:
            student_info = f"time med {studentNames}"

        # HTML email body for teacher
        html_content = f"""
        <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
            <h1>Timen din er registrert!</h1>
            <br/>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <p style="font-size: 16px;"><strong>Hei {teacherName}!</strong></p>
                <br/>
                <p>Din {student_info} er nå registrert i systemet.</p>
                <br/>
                <p><strong>Detaljer:</strong></p>
                <ul style="color: #555;">
                    <li><strong>Elev(er):</strong> {studentNames}</li>
                    <li><strong>Dato og tid:</strong> {formatted_startDate}</li>
                    <li><strong>Varighet:</strong> {duration_text}</li>
                </ul>
                <br/>
                <p><strong>Din kommentar:</strong></p>
                <p style="color: #555; font-style: italic;">"{comment}"</p>
                <br/>
                <p style="color: #777; font-size: 14px;">
                    Eleven(e) har mottatt en bekreftelse med din kommentar. Du kan se alle dine timer på Min Side.
                </p>
                <a href="https://enkellaering.no/min-side-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Gå til Min Side</a>
            </div>
        </div>
        """

        # Send the email
        response = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": recipientTeacherEmail,
            "subject": f"Time registrert: {studentNames} den {formatted_startDate.split(',')[0] if ',' in formatted_startDate else formatted_startDate}",
            "html": html_content
        })

        print(f"✅ Teacher email sent to {recipientTeacherEmail}:", response)
        return response

    except Exception as e:
        print(f"❌ Failed to send teacher email to {recipientTeacherEmail}:", e)
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
        emails.append("kontakt@enkellaering.no")
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
            sleep(3)
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
        admin_emails = [admin['email'] for admin in admins]
        admin_emails.append("kontakt@enkellaering.no")
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
            "to": admin_emails,
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
        emails.append("kontakt@enkellaering.no")
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
            sleep(3) #avoid rate limits
        except Exception as e:
            print(f"❌ Failed to send to {email}: {e}")
            raise e


from time import sleep
def sendEmailsToAddAboutMeText(teachers):
    try:
        resend.api_key = os.environ.get('RESEND_API_KEY')

        for teacher in teachers:

            sleep(2) #avoid rate limit
            
            html_content = f"""
            <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
                <h1>Hei {teacher['firstname']}!</h1>
                <h2>Skriv om deg selv på Enkel Læring</h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <p style="color: #555;">
                        Du har fortsatt ikke skrevet noe om deg selv på nettsiden vår. Dette er viktig for at elevene skal kunne velge deg som lærer.
                    </p>
                    <p style="color: #555;">
                        Venligst skriv noe om deg selv og legg igjen et bilde. Du kan gjøre dette ved å logge inn på Min Side og bla nederst på siden.
                    </p>
                    <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
                </div>
            </div>
            """
            
            try:
                response = resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": teacher['email'],
                    "subject": "Skriv om deg selv på Enkel Læring",
                    "html": html_content
                })
                print(f"✅ Email sent to {teacher['email']}")
            except Exception as e:
                print(f"❌ Failed to send to {teacher['email']}: {e}")
                raise e

        return True
    except Exception as e:
        print("❌ Failed to send emails:", e)
        raise e
    

from time import sleep
def sendEmailsToTeacherAboutTakingQuiz(teachers):
    try:
        resend.api_key = os.environ.get('RESEND_API_KEY')

        for teacher in teachers:
            sleep(2)  # Avoid rate limit
            
            html_content = f"""
            <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
                <h1>Hei {teacher['firstname']}!</h1>
                <h2>Fullfør quizzene dine på Enkel Læring</h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <p style="color: #555;">
                        Du har ikke gjort noen quizer enda. Venligst ta quizene til fagene du underviser i. Dette er viktig slik at elever skal kunne bestille deg som lærer, samt fordi Thomas og Karoline bruker quizresultatene dine til å vurdere hvilke elever som skal få deg som lærer.
                    </p>
                    <p style="color: #555;">
                        For å ta quizzene, logg inn på Min Side og bla ned til quiz-fanen.
                    </p>
                    <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
                </div>
            </div>
            """

            try:
                response = resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": teacher['email'],
                    "subject": "Fullfør quizzene dine på Enkel Læring",
                    "html": html_content
                })
                print(f"✅ Email sent to {teacher['email']}")
            except Exception as e:
                print(f"❌ Failed to send to {teacher['email']}: {e}")
                raise e

        return True
    except Exception as e:
        print("❌ Failed to send emails:", e)
        raise e
    

from time import sleep
def sendEmailsToTeacherAndStudentAboutFewClasses(teachersAndStudents :dict):

    try:
        resend.api_key = os.environ.get('RESEND_API_KEY')

        for teacherUserId in teachersAndStudents.keys():
            sleep(2)  # Avoid rate limit
            ts = teachersAndStudents[teacherUserId]
            students = ts['students']
            studentNames = ', '.join([f"{s['firstname']} {s['lastname']}" for s in students])

            html_content = f"""
            <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
                <h1>Hei {ts['firstname']}!</h1>
                <h2>Du har ikke hatt noen timer med {studentNames} på over to uker.</h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <p style="color: #555;">
                        Kanskje det er på tide å kontakte dem og legge en plan for fremtidige timer?
                    </p>
                    <p style="color: #555;">Dersom eleven(e) ikke ønsker mer undervisning, eller du ikke ønsker eleven, kan du si ifra til Thomas eller Karoline.</p>
                    <p style="color: #999;">Dersom det er ferie eller lignende kan du ignorere denne e-posten.</p>
                    <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
                </div>
            </div>
            """

            #send the emails to the teacher
            try:
                response = resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": ts['email'],
                    "subject": "Lenge siden du har hatt timer med elevene dine",
                    "html": html_content
                })
                print(f"✅ Email sent to {ts['email']}")
            except Exception as e:
                print(f"❌ Failed to send to {ts['email']}: {e}")
                raise e
            
            #send the emails to the students
            for student in students:
                sleep(2) #rate limit

                student_html_content = f"""
                <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
                    <h1>Hei {student['firstname']}!</h1>
                    <h2>Det er over to uker siden {student['firstname_student']} har hatt time med {ts['firstname']}</h2>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <p style="color: #555;">
                            Kanskje det er på tide å kontakte {ts['firstname']} og legge en plan for fremtidige timer?
                        </p>
                        <p style="color: #555;">Dersom dere ikke ønsker mer undervisning kan dere si ifra til Thomas eller Karoline.
                        Hvis det er ferie eller lignende kan dere ignorere denne e-posten.
                        <br/><br/>Kontaktinfo:<br/>Thomas: kontakt@enkellaering.no<br/>Karoline: 906 56 969</p>
                        <p style="color: #999;">*{ts['firstname']} har også fått denne e-posten</p>
                        <a href="https://enkellaering.no/login" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn for å se kontaktinfoen til {ts['firstname']}</a>
                    </div>
                </div>
                """

                try:
                    response = resend.Emails.send({
                        "from": FROM_EMAIL,
                        "to": student['email'],
                        "subject": f"Lenge siden dere har hatt time med {ts['firstname']}",
                        "html": student_html_content
                    })
                    print(f"✅ Email sent to {student['email']}")
                except Exception as e:
                    print(f"❌ Failed to send to {student['email']}: {e}")
                    raise e

        return True
    except Exception as e:
        print("❌ Failed to send emails:", e)
        raise e


from db.gets import get_all_admins, get_teacher_by_user_id
def sendEmailToAdminAboutNewTeacherReferal(referalName :str, referalEmail :str, referalPhone :str, teacherUserId :str):
    
    try:
        admins = get_all_admins()
        emails = [admin['email'] for admin in admins]
        emails.append("kontakt@enkellaering.no")
    except Exception as e:
        raise RuntimeError(f"Error getting the email of admins: {e}")
    
    try:
        teacher = get_teacher_by_user_id(teacherUserId)
        teacher_row = teacher[0]
        print(teacher_row)
        teacherName = f"{teacher_row.get('firstname')} {teacher_row.get('lastname')}"
        if not teacher_row:
            raise ValueError(f"No teacher found with user ID {teacherUserId}")
    except Exception as e:
        raise RuntimeError(f"Error getting teacher by user ID {teacherUserId}: {e}")

    # Email content (HTML)
    html_content = f"""
    <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 30px;">
        <h1>Ny lærerhenvisning fra {teacherName}</h1>
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;"><strong>{referalName}</strong> ble henvist som ny lærer</p>
            <p style="color: #555;">
                <strong>Kontaktinformasjon:</strong><br/>
                Navn: {referalName}<br/>
                E-post: {referalEmail}<br/>
                Telefon: {referalPhone}
            </p>
            <p style="color: #555;">
                <strong>Henvist av:</strong> {teacherName}
            </p>
            <p style="color: #555;">Logg inn på <code>/admin</code> for å følge opp henvisningen.</p>
            <a href="https://enkellaering.no/login-laerer" style="display:inline-block; margin-top: 15px; background-color:#6366F1; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Logg inn</a>
        </div>
    </div>
    """

    # Send email to admins
    for email in emails:
        sleep(3) #rate limits
        try:
            response = resend.Emails.send({
                "from": FROM_EMAIL,
                "to": email,
                "subject": f"Ny lærerhenvisning: {referalName}",
                "html": html_content
            })
            print(f"✅ Email sent to {email}")
        except Exception as e:
            print(f"❌ Failed to send to {email}: {e}")
            raise e

    return True
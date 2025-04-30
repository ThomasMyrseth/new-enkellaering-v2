from flask import Blueprint, request, jsonify
from datetime import datetime
import os
import logging

from .config import bq_client 
from .config import token_required

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


order_bp = Blueprint('order', __name__)



from big_query.gets import get_all_new_students
@order_bp.route('/get-new-students', methods=["GET"])
@token_required
def get_new_students_route(user_id):
    admin_user_id = user_id

    if not admin_user_id:
        return jsonify({
            "message": "Missing admin user id"
        }), 400

    res = get_all_new_students(client=bq_client, admin_user_id=admin_user_id)

    if not res or res.errors:
        print("Error fetching new students")
        return jsonify({
            "message": "Error fetching new students"
        }), 500
    
    result = res.result()
    new_students = [dict(row) for row in result]

    if len(new_students)==0:
        return jsonify({
            "new_students": []
        }), 200
    
    return jsonify({
        "new_students": new_students
    }), 200




from big_query.gets import get_all_students_without_teacher

@order_bp.route('/get-new-students-with-preferred-teacher', methods=["GET"])
@token_required
def get_new_students_with_preferred_teacher_route(user_id):

    try:
        res = get_all_students_without_teacher(client=bq_client, admin_user_id=user_id)
    
        if len(res)==0:
            print("no new students found")
            return jsonify({
                "students_without_teacher": []
            }), 200
        
        return jsonify({
            "students_without_teacher": res
        }), 200
    
    except Exception as e:
        print(f"Error getting new students {e}")
        return jsonify({
            "message": f"Error getting new students {e}"
        }), 500


from big_query.gets import get_new_orders_for_teacher
@order_bp.route('/get-new-students-for-teacher', methods=["GET"])
@token_required
def get_new_orders_for_teacher_route(user_id):

    try:
        res = get_new_orders_for_teacher(client=bq_client, teacher_user_id=user_id)
    
        if len(res)==0:
            print("no new students found")
            return jsonify({
                "new_orders": []
            }), 200
        
        return jsonify({
            "new_orders": res
        }), 200
    
    except Exception as e:
        print(f"Error getting new students {e}")
        return jsonify({
            "message": f"Error getting new students {e}"
        }), 500






from big_query.bq_types import NewStudents
from big_query.alters import setYourTeacher
from big_query.alters import alterNewStudent

@order_bp.route('/update-new-student', methods=["POST"])
@token_required
def update_new_student_workflow(user_id):
    admin_user_id = user_id
    data = request.get_json()

    logging.info(f"data from update new student: {data}")

    # Validate incoming data
    is_valid, error_message = validate_new_student_data(data)
    if not is_valid:
        logging.info("Validation error:", error_message)
        return jsonify({"message": f"Validation error: {error_message}"}), 400

    # Extract fields
    new_student_id = data.get("new_student_id")
    phone = data.get("phone")

    # Build the updates dictionary
    update = {
        "has_called": data.get("has_called"),
        "called_at": data.get("called_at"),
        "has_answered": data.get("has_answered"),
        "answered_at": data.get("answered_at"),
        "has_signed_up": data.get("has_signed_up"),
        "signed_up_at": data.get("signed_up_at"),
        "from_referal": data.get("from_referal"),
        "referee_phone": data.get("referee_phone"),
        "has_assigned_teacher": data.get("has_assigned_teacher"),
        "assigned_teacher_at": data.get("assigned_teacher_at"),
        "assigned_teacher_user_id": data.get("teacher_user_id"),
        "has_finished_onboarding": data.get("has_finished_onboarding"),
        "finished_onboarding_at": data.get("finished_onboarding_at"),
        "comments": data.get("comments"),
        "paid_referee": data.get("paid_referee"),
        "paid_referee_at": data.get("paid_referee_at"),
    }

    # Clean the updates dictionary
    update = clean_updates(update)

    # Perform the update
    try:
        res = alterNewStudent(client=bq_client, new_student_id=new_student_id, admin_user_id=admin_user_id, updates=update)
        res.result()  # Force query execution to detect any errors
    except Exception as e:
        logging.error("BigQuery error:", e)
        return jsonify({"message": "Error while setting updates for new student"}), 500
    
    #set your_teacher in users.students if assigned_teacher_user_id!=NULL
    if  data.get("has_assigned_teacher")==True and data.get("teacher_user_id")!=None:
        try:
            res = setYourTeacher(client=bq_client, phone=phone, your_teacher=data.get("teacher_user_id"))
            res.result()  # Force query execution to detect any errors
        except Exception as e:
            logging.error("Bigquery errror while setting your_teacher", e)
            return jsonify({"message": "Error while setting the teacher in users.students"}), 500


    return jsonify({"message": "Updated new student successfully"}), 200

def clean_updates(updates: dict):
    """Ensure all fields have valid default values."""
    boolean_fields = [
        "has_called", "has_answered", "has_signed_up", "from_referal",
        "has_assigned_teacher", "has_finished_onboarding", "paid_referee"
    ]
    
    timestamp_fields = [
        "called_at", "answered_at", "signed_up_at", "assigned_teacher_at",
        "finished_onboarding_at", "paid_referee_at"
    ]
    
    string_fields = [
        "referee_phone", "assigned_teacher_user_id", "comments"
    ]
    
    # Set default values for missing or `None` fields
    for field in boolean_fields:
        updates[field] = updates.get(field, False)
    
    for field in timestamp_fields:
        updates[field] = updates.get(field) or None  # Keep as `None` if not provided
    
    for field in string_fields:
        updates[field] = updates.get(field) or ""  # Default to ''
    
    return updates

def validate_new_student_data(data: dict) -> tuple[bool, str]:
    """
    Validate the incoming data for updating a new student.

    :param data: Dictionary containing new student data.
    :return: Tuple (is_valid, error_message). If valid, error_message is None.
    """
    required_fields = {
        "new_student_id": str,
        "has_called": bool,
        "has_answered": bool,
        "has_signed_up": bool,
        "from_referal": bool,
        "has_assigned_teacher": bool,
    }

    optional_fields = {
        "called_at": str,
        "answered_at": str,
        "signed_up_at": str,
        "referee_phone": str,
        "assigned_teacher_at": str,
        "teacher_user_id": str,
        "has_finished_onboarding": bool,
        "finished_onboarding_at": str,
        "comments": str,
        "paid_referee": bool,
        "paid_referee_at": str,
    }

    # Check required fields
    for field, field_type in required_fields.items():
        if field not in data:
            return False, f"Missing required field: {field}"
        if not isinstance(data[field], field_type):
            return False, f"Invalid type for field '{field}': Expected {field_type}, got {type(data[field])}"

    # Check optional fields (if provided)
    for field, field_type in optional_fields.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], field_type):
                return False, f"Invalid type for field '{field}': Expected {field_type}, got {type(data[field])}"

    return True, None




from big_query.deletes import hideNewStudent
@order_bp.route('/hide-new-student', methods=["POST"])
@token_required
def delete_new_student(user_id):
    admin_user_id = user_id
    data = request.get_json()

    # Extract fields
    row_id = data.get("row_id")

    # Perform the update
    try:
        res = hideNewStudent(client=bq_client, row_id=row_id, admin_user_id=admin_user_id)
        res.result()  # Force query execution to detect any errors
    except Exception as e:
        logging.error("BigQuery error:", e)
        return jsonify({"message": "Error while deleting for new student"}), 500

    return jsonify({"message": "New student deleted successfully"}), 200



from big_query.deletes import hideNewOrderFromNewStudentsTable
@order_bp.route('/hide-new-student-from-new-students-table', methods=["POST"])
@token_required
def delete_new_student_from_new_students_table_route(user_id):
    admin_user_id = user_id
    data = request.get_json()

    # Extract fields
    new_student_id = data.get("new_student_id")

    # Perform the update
    try:
        res = hideNewOrderFromNewStudentsTable(new_student_id=new_student_id, admin_user_id=admin_user_id, client=bq_client)
        res.result()  # Force query execution to detect any errors
    except Exception as e:
        logging.error("BigQuery error:", e)
        return jsonify({"message": "Error while deleting for new student"}), 500

    return jsonify({"message": "New student deleted successfully"}), 200




import uuid
import pytz
from big_query.inserts import insert_new_student
from .email import sendNewStudentToAdminMail
@order_bp.route('/submit-new-student', methods = ["POST"])
def submit_new_student_route():
    data = request.get_json()
    phone = data.get("phone")
    norway_tz = pytz.timezone("Europe/Oslo")


    if not phone:
        return jsonify({"message": "Missing phone number"}), 400
    
    try:
        ns = NewStudents(
            new_student_id=str(uuid.uuid4()),
            phone=phone,
            preffered_teacher= '',
            created_at=datetime.now(norway_tz),
            has_called=False,
            called_at=None,
            has_answered=False,
            answered_at=None,
            has_signed_up=False,
            signed_up_at=None,
            from_referal=False,
            referee_phone=None,
            referee_name = None,
            has_assigned_teacher=False,
            assigned_teacher_at=None,
            assigned_teacher_user_id=None,
            has_finished_onboarding=False,
            finished_onboarding_at=None,
            comments=None,
            paid_referee=False,
            paid_referee_at=None
        )

        res = insert_new_student(client=bq_client, new_student=ns)

        if not res or res.errors:
            print("An error occured inserting nre student", res.errors)
            return jsonify({
                "message": "An error occured while inserting new student"
            }), 500
    except Exception as e:
        print(f"Error adding new student {e}")
        return jsonify({"message": str(e)}), 500
    
    try:
        sendNewStudentToAdminMail(newStudentPhone=phone)
    except Exception as e:
        print(f"Error sending email about new student {e}")
        return jsonify({"message": f"Error sending email about the new student: {e}"}), 500
    
    print("response: ", res.result())
    return jsonify({"message": "New student successfully inserted"}), 200
    



from big_query.bq_types import NewStudentWithPreferredTeacher
from big_query.inserts import insert_new_student_with_preferred_teacher
@order_bp.route('/submit-new-student-with-preffered-teacher', methods = ["POST"])
def submit_new_student_with_preffered_route():
    data = request.get_json()
    phone = data.get("phone")
    physical_or_digital = data.get("physical_or_digital") #TRUE=physical
    preffered_teacher = data.get("preffered_teacher")


    if not phone:
        return jsonify({"message": "Missing phone number"}), 400


    ns  = NewStudentWithPreferredTeacher(
        new_student_id=str(uuid.uuid4()),
        phone=phone,
        teacher_called=False,  # Renamed from has_called
        created_at=datetime.now(pytz.timezone("Europe/Oslo")),
        preferred_teacher=preffered_teacher or '',
        teacher_answered=False,  # Renamed from has_answered
        student_signed_up=False,  # Renamed from has_signed_up
        teacher_has_accepted=False,  # Renamed from has_assigned_teacher
        hidden=False,
        physical_or_digital=physical_or_digital,
        # Optional fields
        called_at=None,
        answered_at=None,
        signed_up_at=None,
        teacher_accepted_at=None,  # Renamed from assigned_teacher_at
        comments=None
    )



    try:
        res = insert_new_student_with_preferred_teacher(client=bq_client, new_student=ns)

        if not res or res.errors:
            raise(Exception(f"An error occured inserting new student {res.errors}"))
    
        return jsonify({"message": "New student successfully inserted"}), 200

    except Exception as e:
        print(f"Error adding nee student with preffered teacher {e}")
        return jsonify({"message": str(e)}), 500
    

    
from .email import sendNewStudentToAdminMail
@order_bp.route('/submit-new-referal', methods = ["POST"])
def submit_new_referal_route():
    data = request.get_json()
    referal_phone= data.get("referal_phone")
    referee_phone = data.get("referee_phone")
    referee_name = data.get("referee_name")
    account_number = data.get("account_number")
    norway_tz = pytz.timezone("Europe/Oslo")


    if not (referal_phone and referee_phone and referee_name and account_number):
        return jsonify({"message": "Missing fields for adding new referal"}), 400
    
    ns = NewStudents(
        new_student_id=str(uuid.uuid4()),
        phone=referal_phone,
        created_at=datetime.now(norway_tz),
        has_called=False,
        called_at=None,
        has_answered=False,
        answered_at=None,
        has_signed_up=False,
        signed_up_at=None,
        from_referal=True,
        referee_phone=referee_phone,
        referee_name = referee_name,
        has_assigned_teacher=False,
        assigned_teacher_at=None,
        assigned_teacher_user_id=None,
        has_finished_onboarding=False,
        finished_onboarding_at=None,
        comments=None,
        paid_referee=False,
        paid_referee_at=None,
        referee_account_number = account_number,
        preffered_teacher=None
    )

    try:
        sendNewStudentToAdminMail(newStudentPhone=referal_phone)
    except Exception as e:
        return jsonify({"message": f"Error sending email about the new student: {e}"}), 500
    

    res = insert_new_student(client=bq_client, new_student=ns)

    if not res or res.errors:
        print("An error occured inserting nre student", res.errors)
        return jsonify({
            "message": "An error occured while inserting new student"
        }), 500
    
    print("response: ", res.result())
    return jsonify({"message": "New student successfully inserted"}), 200





from big_query.inserts import insert_new_student_order
from .email import sendNewStudentToTeacherMail, sendNewOrderEmailToAdmin
from big_query.gets import get_teacher_by_user_id, get_student_by_user_id

@order_bp.route('/request-new-teacher', methods=["POST"])
@token_required
def request_new_teacher_route(user_id):
    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    physical_or_digital = data.get('physical_or_digital') or False
    address = data.get('address') or ''
    comments = data.get('comments') or ''

    firstname_teacher = ''
    lastname_teacher = ''
    phone_teacher = ''

    if not user_id or not teacher_user_id or physical_or_digital==None:
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        teacherItterator = get_teacher_by_user_id(client=bq_client, user_id=teacher_user_id)
        teacher = next(teacherItterator, None)  # Returns the first row or None if the iterator is empty
        if (teacher):
            firstname_teacher=teacher['firstname']
            lastname_teacher=teacher['lastname']
            phone_teacher=teacher['phone']
            name = teacher['firstname'] + " " + teacher['lastname']
            sendNewStudentToTeacherMail(receipientTeacherMail=teacher['email'], teachername=name)
    except Exception as e:
        print(f"Error sending email to teacher {e}")
        return jsonify({"messsage": f"Error sending email to teacher: {e}"}), 500

    #send an email to admin
    try:
        query_job = get_student_by_user_id(client=bq_client, user_id=user_id)
        student_row = next(query_job.result(), None)

        if student_row:
            sendNewOrderEmailToAdmin(
                student_row['firstname_parent'],
                student_row['lastname_parent'],
                student_row['phone_parent'],
                firstname_teacher,
                lastname_teacher,
                phone_teacher
            )
        else:
            print("Student not found")
            return jsonify({"message": "Student not found"}), 404
    except Exception as e:
        print(f"Error sending email about new order {e}")
        return jsonify({"message": f"Error sending email about new orer {e}"})

    try:
        res =  insert_new_student_order(student_user_id=user_id, teacher_user_id=teacher_user_id, accept=None, physical_or_digital=physical_or_digital, location=address, comments=comments, bq_client=bq_client)
        if res:
            return jsonify({"message": "inserted new student order"}), 200
        
    except Exception as e:
        print(f"error requesting new teacher {e}")
        return jsonify({"message": f"Error inserting new student order {e}"}), 500


from big_query.gets import get_new_orders
@order_bp.route('/get-new-orders', methods=['GET'])
@token_required
def get_new_teachers_route(user_id):
    student_user_id = user_id

    if not student_user_id:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        teachers = get_new_orders(student_user_id=student_user_id, client=bq_client)
        return {"teachers": teachers}, 200
    
    except Exception as e:
        print(f"error getting new teachers {e}")
        return jsonify({"message": f"Error getting new teachers {e}"}), 500
    

from big_query.alters import cansel_new_order

@order_bp.route('/cansel-order', methods=["POST"])
@token_required
def cansel_new_order_route(user_id):
    student_user_id = user_id
    if not student_user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    row_id = data.get('row_id')
    if not row_id:
        print("missing row id")
        return jsonify({"message": "Missing row id"}), 400

    try:
        response = cansel_new_order(row_id=row_id, client=bq_client)

        if (response):
            return jsonify({"message": "Succesfully hid a row"}), 200
        raise(Exception("Error hiding a row"))
    
    except Exception as e:
        print(f"error hiding a row {e}")
        return jsonify({f"message": "Error hiding a row {e}"}), 500


from big_query.alters import update_new_order

@order_bp.route('/update-order', methods=["POST"])
@token_required
def update_order_data_route(user_id):
    student_user_id = user_id

    if not student_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json()
    row_id= data.get('row_id')
    physical_or_digital = data.get('physical_or_digital')
    meeting_location = data.get('meeting_location')
    #comments = data.get('comments')

    if not row_id:
        print("missing row id")
        return jsonify({"message": "Missing row id"}), 400
    
    try:
        res = update_new_order(row_id=row_id, physical_or_digital=physical_or_digital, preferred_location=meeting_location, client=bq_client)
        if res:
            return jsonify({"message": "Updated new order"}), 200
        
        raise(Exception("Error updating new order"))
    
    except Exception as e:
        print(f"error updating new order {e}")
        return jsonify({"message": f"Error updating new order {e}"}), 500


from .email import sendAcceptOrRejectToStudentMail
@order_bp.route('/teacher-accepts', methods=["POST"])
@token_required
def teacher_accepts_route(user_id):
    teacher_user_id = user_id

    if not teacher_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json()
    row_id= data.get('row_id')
    student_user_id = data.get('student_user_id')
    firstname = data.get('firstname_student')
    mail = data.get('mail_student')

    teacher_firstname = data.get('firstname_teacher')
    teacher_lastname = data.get('lastname_teacher')
    accept = data.get('accept')

    print("teacher lastname: ", teacher_lastname)
    print("accept: ", accept)
    
    if not (row_id and student_user_id and firstname and teacher_firstname and teacher_lastname and mail):
        print("missing fields")
        print("row_id", row_id)
        print(student_user_id)
        print(firstname)
        print(teacher_firstname)
        print(teacher_lastname)
        print(mail)
        return jsonify({"message": "Missing fields"}), 400
    
    try:
        name = teacher_firstname + " " + teacher_lastname
        sendAcceptOrRejectToStudentMail(studentName=firstname, teacherName=name, acceptOrReject=accept, receipientStudentMail=mail)
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"message": f"Error sending email {e}"}), 500
    
    try:
        res = update_new_order(row_id=row_id, teacher_accepted_student=accept, client=bq_client)
        if res:
            return jsonify({"message": "Updated new order"}), 200
        
        raise(Exception("Error updating new order"))
    
    except Exception as e:
        print(f"error updating new order {e}")
        return jsonify({"message": f"Error updating new order {e}"}), 500

from big_query.deletes import removeTeacherFromStudent
@order_bp.route('/remove-teacher-from-student', methods=["POST"])
@token_required
def remove_teacher_from_student_route(user_id):
    admin_user_id = user_id

    if not admin_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json()
    student_user_id = data.get('student_user_id')
    teacher_user_id = data.get('teacher_user_id')

    if not student_user_id or not teacher_user_id:
        return jsonify({"message": "Missing fields"}), 402

    
    try:
        res = removeTeacherFromStudent(teacher_user_id=teacher_user_id, student_user_id=student_user_id, client=bq_client)
        if res:
            return jsonify({"message": "removed teacher from student"}), 200
        
        raise(Exception("Error removing teacher from student"))
    
    except Exception as e:
        print(f"Error removing teacher from student {e}")
        return jsonify({"message": f"Error removing teacher from student {e}"}), 500





from big_query.deletes import hideOldOrders
@order_bp.route('/hide-old-orders', methods=['GET'])
def hide_old_orders_route():
    days = 7

    try:
        hideOldOrders(daysOld=days, client=bq_client)
        return jsonify({"message": "Hid old orders!"}), 200
    except Exception as e:
        print(f"Error hiding old orders {e}")
        return jsonify({"message": f"Error hiding old orders! {e}"}), 500




from big_query.gets import get_teacher_student
@order_bp.route('/get-teacher-student', methods=['GET'])
def get_teacher_student_route():

    try:
        ts = get_teacher_student(client=bq_client)
        return {"teacher_student": ts}, 200
    
    except Exception as e:
        print(f"error getting new teachers {e}")
        return jsonify({"message": f"Error getting new teachers {e}"}), 500


from big_query.inserts import addTeacherToNewStudent
@order_bp.route("/assign-teacher-for-student", methods=["POST"])
@token_required
def assign_teacher_for_student(user_id):
    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    student_user_id = data.get('student_user_id')

    if not user_id:
        return jsonify({"message": "Unautrhorizes"}), 402

    if not student_user_id or not teacher_user_id:
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        response = addTeacherToNewStudent(client=bq_client, student_user_id=student_user_id, teacher_user_id=teacher_user_id, admin_user_id=user_id)

        response.result()
        return jsonify({"message": "Teacher assigned successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"An error occured {e}"}), 500
    

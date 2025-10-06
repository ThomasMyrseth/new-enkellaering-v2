from concurrent.futures import thread
import re
import threading
from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from .config import token_required
from cloud_sql.gets import (
    get_all_new_students,
    get_all_students_without_teacher,
    get_new_orders_for_teacher,
    get_teacher_by_user_id,
    get_student_by_user_id,
    get_new_orders,
    get_teacher_student
)
from cloud_sql.inserts import (
    insert_new_student,
    insert_new_student_order,
    insert_new_student_with_preferred_teacher,
    add_teacher_to_new_student
)
from cloud_sql.alters import (
    alter_new_student,
    set_your_teacher as cloud_set_your_teacher,
    cancel_new_order,
    update_new_order as cloud_update_new_order,
)
from cloud_sql.deletes import (
    hide_new_student,
    hide_new_order_from_new_students_table,
    remove_teacher_from_student as cloud_remove_teacher_from_student,
    hide_old_orders
)


order_bp = Blueprint('order', __name__)



@order_bp.route('/get-new-students', methods=["GET"])
@token_required
def get_new_students_route(user_id):
    try:
        students = get_all_new_students(user_id)
        return jsonify({"new_students": students}), 200
    except Exception as e:
        logging.error(f"Error fetching new students: {e}")
        return jsonify({"message": str(e)}), 500




@order_bp.route('/get-new-students-with-preferred-teacher', methods=["GET"])
@token_required
def get_new_students_with_preferred_teacher_route(user_id):
    try:
        students = get_all_students_without_teacher(user_id)
        return jsonify({"students_without_teacher": students}), 200
    except Exception as e:
        logging.error(f"Error fetching students without teacher: {e}")
        return jsonify({"message": str(e)}), 500


@order_bp.route('/get-new-students-for-teacher', methods=["GET"])
@token_required
def get_new_orders_for_teacher_route(user_id):
    try:
        orders = get_new_orders_for_teacher(user_id)
        return jsonify({"new_orders": orders}), 200
    except Exception as e:
        logging.error(f"Error fetching new orders: {e}")
        return jsonify({"message": str(e)}), 500






@order_bp.route('/update-new-student', methods=["POST"])
@token_required
def update_new_student_workflow(user_id):
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
    updates = {
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
    updates = clean_updates(updates)

    try:
        alter_new_student(new_student_id, user_id, updates)
    except Exception as e:
        logging.error(f"Error updating new student: {e}")
        return jsonify({"message": str(e)}), 500

    if data.get("has_assigned_teacher"):
        try:
            cloud_set_your_teacher(data["phone"], data["teacher_user_id"])
        except Exception as e:
            logging.error(f"Error setting your_teacher: {e}")
            return jsonify({"message": str(e)}), 500

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

    return True, "valid"




@order_bp.route('/hide-new-student', methods=["POST"])
@token_required
def delete_new_student(user_id):
    data = request.get_json()
    row_id = data.get("row_id")
    try:
        hide_new_student(row_id, user_id)
    except Exception as e:
        logging.error(f"Error hiding new student: {e}")
        return jsonify({"message": str(e)}), 500
    return jsonify({"message": "New student deleted successfully"}), 200



@order_bp.route('/hide-new-student-from-new-students-table', methods=["POST"])
@token_required
def delete_new_student_from_new_students_table_route(user_id):
    data = request.get_json()
    new_student_id = data.get("new_student_id")
    try:
        hide_new_order_from_new_students_table(new_student_id, user_id)
    except Exception as e:
        logging.error(f"Error hiding new student from table: {e}")
        return jsonify({"message": str(e)}), 500
    return jsonify({"message": "New student deleted successfully"}), 200




import uuid
import pytz
from .email import sendNewStudentToAdminMail
@order_bp.route('/submit-new-student', methods = ["POST"])
def submit_new_student_route():
    data = request.get_json()
    phone = data.get("phone")
    norway_tz = pytz.timezone("Europe/Oslo")

    if not phone:
        return jsonify({"message": "Missing phone number"}), 400
    try:
        ns = {
            "new_student_id": str(uuid.uuid4()),
            "phone": phone,
            "preffered_teacher": '',
            "created_at": datetime.now(norway_tz),
            "has_called": False,
            "called_at": None,
            "has_answered": False,
            "answered_at": None,
            "has_signed_up": False,
            "signed_up_at": None,
            "from_referal": False,
            "referee_phone": None,
            "referee_name": None,
            "referee_account_number": None,
            "has_assigned_teacher": False,
            "assigned_teacher_at": None,
            "assigned_teacher_user_id": None,
            "has_finished_onboarding": False,
            "finished_onboarding_at": None,
            "comments": None,
            "paid_referee": False,
            "paid_referee_at": None
        }
        insert_new_student(ns)
    except Exception as e:
        print(f"Error inserting new student: {e}")
        return jsonify({"message": str(e)}), 500

    t = threading.Thread(
        target=sendNewStudentToAdminMail,
        args=(phone,),
        daemon=True  # doesn't block process exit
    )
    t.start()
    
    return jsonify({"message": "New student successfully inserted"}), 200
    



@order_bp.route('/submit-new-student-with-preffered-teacher', methods = ["POST"])
def submit_new_student_with_preffered_route():
    data = request.get_json()
    phone = data.get("phone")
    physical_or_digital = data.get("physical_or_digital")
    preffered_teacher = data.get("preffered_teacher")
    if not phone:
        return jsonify({"message": "Missing phone number"}), 400
    ns = {
        "new_student_id": str(uuid.uuid4()),
        "phone": phone,
        "teacher_called": False,
        "created_at": datetime.now(pytz.timezone("Europe/Oslo")),
        "preferred_teacher": preffered_teacher or '',
        "teacher_answered": False,
        "student_signed_up": False,
        "teacher_has_accepted": False,
        "hidden": False,
        "physical_or_digital": physical_or_digital,
        "called_at": None,
        "answered_at": None,
        "signed_up_at": None,
        "teacher_accepted_at": None,
        "comments": None
    }
    try:
        insert_new_student_with_preferred_teacher(ns)
        return jsonify({"message": "New student successfully inserted"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

    
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
    ns = {
        "new_student_id": str(uuid.uuid4()),
        "phone": referal_phone,
        "created_at": datetime.now(norway_tz),
        "has_called": False,
        "called_at": None,
        "has_answered": False,
        "answered_at": None,
        "has_signed_up": False,
        "signed_up_at": None,
        "from_referal": True,
        "referee_phone": referee_phone,
        "referee_name": referee_name,
        "has_assigned_teacher": False,
        "assigned_teacher_at": None,
        "assigned_teacher_user_id": None,
        "has_finished_onboarding": False,
        "finished_onboarding_at": None,
        "comments": None,
        "paid_referee": False,
        "paid_referee_at": None,
        "referee_account_number": account_number,
        "preffered_teacher": None
    }
    thread = threading.Thread(
        target=sendNewStudentToAdminMail,
        args=(referal_phone,),
        daemon=True  # doesn't block process exit
    )
    thread.start()

    try:
        insert_new_student(ns)
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    return jsonify({"message": "New student successfully inserted"}), 200





from .email import sendNewStudentToTeacherMail, sendNewOrderEmailToAdmin
@order_bp.route('/request-new-teacher', methods=["POST"])
@token_required
def request_new_teacher_route(user_id):
    data = request.get_json()
    teacher_user_id = data.get('teacher_user_id')
    physical_or_digital = data.get('physical_or_digital') or False
    location = data.get('location') or ''
    comments = data.get('comments') or ''
    if not user_id or not teacher_user_id or physical_or_digital is None:
        return jsonify({"message": "Missing required fields"}), 400
    try:
        teacher_list = get_teacher_by_user_id(teacher_user_id)
        teacher = teacher_list[0] if teacher_list else None
        if teacher:
            name = teacher.get('firstname', '') + " " + teacher.get('lastname', '')
            sendNewStudentToTeacherMail(receipientTeacherMail=teacher.get('email', ''), teachername=name)
    except Exception as e:
        return jsonify({"messsage": f"Error sending email to teacher: {e}"}), 500

    try:
        insert_new_student_order(user_id, teacher_user_id, accept=None, physical_or_digital=physical_or_digital, location=location, comments=comments)
    except Exception as e:
        print(f"Error inserting new student order: {e}")
        return jsonify({"message": f"Error inserting new student order {e}"}), 500
    
    #send email to admin

    student_list = get_student_by_user_id(user_id)
    student_row = student_list[0] if student_list else None
    if student_row:
        thread = threading.Thread(
            target=sendNewOrderEmailToAdmin,
            args=(
                student_row.get('firstname_parent', ''),
                student_row.get('lastname_parent', ''),
                student_row.get('phone_parent', ''),
                teacher.get('firstname', '') if teacher else '',
                teacher.get('lastname', '') if teacher else '',
                teacher.get('phone', '') if teacher else ''
            ),            daemon=True  # doesn't block process exit
        )
        thread.start()
    else:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({"message": "inserted new student order"}), 200

@order_bp.route('/get-new-orders', methods=['GET'])
@token_required
def get_new_teachers_route(user_id):
    student_user_id = user_id
    if not student_user_id:
        print("Unauthorized to get-new-orders")
        return jsonify({"message": "Unauthorized"}), 401
    try:
        teachers = get_new_orders(student_user_id)
        return {"teachers": teachers}, 200
    except Exception as e:
        print(f"Error getting new orders for student: {e}")
        return jsonify({"message": f"Error getting new teachers {e}"}), 500
    

@order_bp.route('/cansel-order', methods=["POST"])
@token_required
def cansel_new_order_route(user_id):
    student_user_id = user_id
    if not student_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    data = request.get_json()
    row_id = data.get('row_id')
    if not row_id:
        return jsonify({"message": "Missing row id"}), 400
    try:
        cancel_new_order(row_id)
        return jsonify({"message": "Succesfully hid a row"}), 200
    except Exception as e:
        return jsonify({"message": f"Error hiding a row {e}"}), 500


@order_bp.route('/update-order', methods=["POST"])
@token_required
def update_order_data_route(user_id):
    student_user_id = user_id
    if not student_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    data = request.get_json()
    row_id = data.get('row_id')
    physical_or_digital = data.get('physical_or_digital')
    meeting_location = data.get('meeting_location')
    comments = data.get('comments')
    if not row_id:
        return jsonify({"message": "Missing row id"}), 400
    try:
        cloud_update_new_order(row_id, None, physical_or_digital, meeting_location, comments)
        return jsonify({"message": "Updated new order"}), 200
    except Exception as e:
        print(f"Error updating new order: {e}")
        return jsonify({"message": f"Error updating new order {e}"}), 500


from .email import sendAcceptOrRejectToStudentMail
@order_bp.route('/teacher-accepts', methods=["POST"])
@token_required
def teacher_accepts_route(user_id):
    teacher_user_id = user_id
    if not teacher_user_id:
        return jsonify({"message": "Unauthorized"}), 401
    data = request.get_json()
    row_id = data.get('row_id')
    student_user_id = data.get('student_user_id')
    firstname = data.get('firstname_student')
    mail = data.get('mail_student')
    teacher_firstname = data.get('firstname_teacher')
    teacher_lastname = data.get('lastname_teacher')
    accept = data.get('accept')
    if not (row_id and student_user_id and firstname and teacher_firstname and teacher_lastname and mail):
        return jsonify({"message": "Missing fields"}), 400
    try:
        name = teacher_firstname + " " + teacher_lastname
        sendAcceptOrRejectToStudentMail(studentName=firstname, teacherName=name, acceptOrReject=accept, receipientStudentMail=mail)
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"message": f"Error sending email {e}"}), 500
    try:
        cloud_update_new_order(row_id, True, None, None, None)
        return jsonify({"message": "Updated new order"}), 200
    except Exception as e:
        print(f"Error updating new order: {e}")
        return jsonify({"message": f"Error updating new order {e}"}), 500

@order_bp.route('/remove-teacher-from-student', methods=["POST"])
@token_required
def remove_teacher_from_student_route(user_id):
    data = request.get_json()
    student_user_id = data.get('student_user_id')
    teacher_user_id = data.get('teacher_user_id')
    admin_user_id = user_id
    if not student_user_id or not teacher_user_id:
        return jsonify({"message": "Missing fields"}), 402
    try:
        cloud_remove_teacher_from_student(teacher_user_id, student_user_id, admin_user_id)
        return jsonify({"message": "removed teacher from student"}), 200
    except Exception as e:
        return jsonify({"message": f"Error removing teacher from student {e}"}), 500





@order_bp.route('/hide-old-orders', methods=['GET'])
def hide_old_orders_route():
    days = 7
    try:
        hide_old_orders(days)
        return jsonify({"message": "Hid old orders!"}), 200
    except Exception as e:
        return jsonify({"message": f"Error hiding old orders! {e}"}), 500




@order_bp.route('/get-teacher-student', methods=['GET'])
def get_teacher_student_route():
    try:
        ts = get_teacher_student()
        return {"teacher_student": ts}, 200
    except Exception as e:
        return jsonify({"message": f"Error getting new teachers {e}"}), 500


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
        add_teacher_to_new_student(student_user_id, teacher_user_id, user_id)
        return jsonify({"message": "Teacher assigned successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"An error occured {e}"}), 500



from cloud_sql.inserts import insertNewTeacherReferal
from server_routes.email import sendEmailToAdminAboutNewTeacherReferal
@order_bp.route('/submit-new-teacher-referal', methods=["POST"])
@token_required
def submit_new_teacher_referal_route(user_id):
    data = request.get_json()
    referal_phone = data.get('referal_phone')
    referal_email = data.get('referal_email', '')
    referal_name = data.get('referal_name')

    if not referal_phone or not referal_name:
        return jsonify({"message": "Missing required fields"}), 400
    if not user_id:
        logging.error("Unauthorized access attempt")
        return jsonify({"message": "Unauthorized"}), 402

    try:
        insertNewTeacherReferal(user_id, referal_phone, referal_name, referal_email)
    except Exception as e:
        logging.error(f"Error inserting new teacher referal: {e}")
        return jsonify({"message": f"An error occured {e}"}), 500
    
    thread = threading.Thread(
        target=sendEmailToAdminAboutNewTeacherReferal,
        args=(referal_name, referal_email, referal_phone, user_id),
        daemon=True  # doesn't block process exit
    )
    thread.start()

    
    return jsonify({"message": "New teacher referal submitted successfully"}), 200

import os
from dotenv import load_dotenv
import psycopg2
from decimal import Decimal

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_USER_PASSWORD")

def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def execute_modify(sql, params=None):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
        conn.commit()
    finally:
        conn.close()

def alter_new_student(new_student_id: str, admin_user_id: str, updates: dict):
    sql = """
        UPDATE public.new_students ns
        SET
            has_called = %s,
            called_at = %s,
            has_answered = %s,
            answered_at = %s,
            has_signed_up = %s,
            signed_up_at = %s,
            from_referal = %s,
            referee_phone = %s,
            has_assigned_teacher = %s,
            assigned_teacher_at = %s,
            assigned_teacher_user_id = %s,
            has_finished_onboarding = %s,
            finished_onboarding_at = %s,
            comments = %s,
            paid_referee = %s,
            paid_referee_at = %s
        WHERE ns.new_student_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    params = (
        updates.get("has_called"),
        updates.get("called_at"),
        updates.get("has_answered"),
        updates.get("answered_at"),
        updates.get("has_signed_up"),
        updates.get("signed_up_at"),
        updates.get("from_referal"),
        updates.get("referee_phone"),
        updates.get("has_assigned_teacher"),
        updates.get("assigned_teacher_at"),
        updates.get("assigned_teacher_user_id"),
        updates.get("has_finished_onboarding"),
        updates.get("finished_onboarding_at"),
        updates.get("comments"),
        updates.get("paid_referee"),
        updates.get("paid_referee_at"),
        new_student_id,
        admin_user_id
    )
    return execute_modify(sql, params)

def set_has_signed_up(phone: str):
    sql = """
        UPDATE public.new_students
        SET has_signed_up = TRUE,
            signed_up_at = NOW()
        WHERE phone = %s
    """
    return execute_modify(sql, (phone,))

def set_your_teacher(phone: str, your_teacher: str):
    sql = """
        UPDATE public.students
        SET your_teacher = %s
        WHERE phone_parent = %s
    """
    return execute_modify(sql, (your_teacher, phone))

def change_teacher_by_user_id(
    student_user_id: str,
    new_teacher_user_id: str,
    admin_user_id: str,
    old_teacher_user_id: str
):
    sql = """
        UPDATE public.teacher_student ts
        SET teacher_user_id = %s
        WHERE ts.student_user_id = %s
          AND ts.teacher_user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (new_teacher_user_id, student_user_id, old_teacher_user_id, admin_user_id))

def remove_teacher_from_student(student_user_id: str, teacher_user_id: str, admin_user_id: str):
    sql = """
        UPDATE public.teacher_student ts
        SET hidden = TRUE
        WHERE ts.student_user_id = %s
          AND ts.teacher_user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (student_user_id, teacher_user_id, admin_user_id))

def set_classes_to_invoiced(class_ids: list, admin_user_id: str):
    sql = """
        UPDATE public.classes c
        SET invoiced_student = TRUE,
            invoiced_student_at = NOW()
        WHERE c.class_id = ANY(%s)
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (class_ids, admin_user_id))

def set_classes_to_paid(class_ids: list, admin_user_id: str):
    sql = """
        UPDATE public.classes c
        SET paid_teacher = TRUE,
            paid_teacher_at = NOW()
        WHERE c.class_id = ANY(%s)
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (class_ids, admin_user_id))

def set_student_to_inactive(student_user_id: str, admin_user_id: str):
    sql = """
        UPDATE public.students s
        SET is_active = FALSE
        WHERE s.user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (student_user_id, admin_user_id))

def set_student_to_active(student_user_id: str, admin_user_id: str):
    print("student_user_id", student_user_id)
    print("admin_user_id", admin_user_id)
    sql = """
        UPDATE public.students s
        SET is_active = TRUE
        WHERE s.user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
              AND t.admin=TRUE
          )
    """
    return execute_modify(sql, (student_user_id, admin_user_id))


def toggle_want_more_students(physical: bool, digital: bool, teacher_user_id: str):
    sql = """
        UPDATE public.teachers
        SET digital_tutouring = %s,
            physical_tutouring = %s
        WHERE user_id = %s
    """
    return execute_modify(sql, (digital, physical, teacher_user_id))

def update_student_notes(admin_user_id: str, student_user_id: str, notes: str):
    sql = """
        UPDATE public.students
        SET notes = %s
        WHERE user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (notes, student_user_id, admin_user_id))


def update_teacher_notes(admin_user_id: str, teacher_user_id: str, notes: str):
    sql = """
        UPDATE public.teachers
        SET notes = %s
        WHERE user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (notes, teacher_user_id, admin_user_id))

def cancel_new_order(row_id: str):
    sql = """
        UPDATE public.teacher_student
        SET hidden = TRUE
        WHERE row_id = %s
    """
    return execute_modify(sql, (row_id,))

from typing import Optional

def update_new_order(
    row_id: str,
    teacher_accepted_student: Optional[bool] = None,
    physical_or_digital: Optional[bool] = None,
    preferred_location: Optional[str] = None,
    comments: Optional[str] = None
):
    sql = "UPDATE public.teacher_student SET "
    parts = []
    params = []
    if teacher_accepted_student is not None:
        parts.append("teacher_accepted_student = %s")
        params.append(teacher_accepted_student)
    if physical_or_digital is not None:
        parts.append("physical_or_digital = %s")
        params.append(physical_or_digital)
    if preferred_location is not None:
        parts.append("preferred_location = %s")
        params.append(preferred_location)
    if comments is not None:
        parts.append("order_comments = %s")
        params.append(comments)
    if not parts:
        raise ValueError("No fields provided for update")
    sql += ", ".join(parts) + " WHERE row_id = %s"
    params.append(row_id)
    return execute_modify(sql, params)

def update_teacher_profile(
    teacher_user_id: str,
    firstname: str,
    lastname: str,
    email: str,
    phone: str,
    address: str,
    postal_code: str,
    additional_comments: Optional[str] = None,
    location: Optional[str] = None,
    physical: Optional[bool] = None,
    digital: Optional[bool] = None
):
    sql = """
        UPDATE public.teachers
        SET firstname = %s,
            lastname = %s,
            email = %s,
            phone = %s,
            address = %s,
            postal_code = %s,
            additional_comments = %s,
            location = %s,
            physical_tutouring = %s,
            digital_tutouring = %s
        WHERE user_id = %s
    """
    return execute_modify(sql, (
        firstname, lastname, email, phone, address, postal_code,
        additional_comments, location, physical, digital,
        teacher_user_id
    ))

def update_travel_payment(travel_payment: dict, admin_user_id: str):
    sql = """
        UPDATE public.teacher_student
        SET travel_pay_to_teacher = %s,
            travel_pay_from_student = %s
        WHERE student_user_id = %s
          AND teacher_user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s
          )
    """
    return execute_modify(sql, (
        Decimal(str(travel_payment["travel_pay_to_teacher"])),
        Decimal(str(travel_payment["travel_pay_from_student"])),
        travel_payment["student_user_id"],
        travel_payment["teacher_user_id"],
        admin_user_id
    ))
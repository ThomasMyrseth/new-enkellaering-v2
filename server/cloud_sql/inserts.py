import os
from dotenv import load_dotenv
import psycopg2
from datetime import datetime, timezone
from .sql_types import Classes, Teacher, Students, NewStudents, NewStudentWithPreferredTeacher

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

def insert_teacher(teacher: Teacher):
    sql = """
        INSERT INTO public.teachers (
            user_id, firstname, lastname, email, phone, address, postal_code,
            hourly_pay, resigned, additional_comments, created_at, admin,
            resigned_at, location, digital_tutouring,
            physical_tutouring
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        teacher.user_id, teacher.firstname, teacher.lastname, teacher.email,
        teacher.phone, teacher.address, teacher.postal_code, teacher.hourly_pay,
        teacher.resigned, teacher.additional_comments, teacher.created_at,
        teacher.admin, teacher.resigned_at, teacher.location,
        teacher.digital_tutouring, teacher.physical_tutouring
    )
    execute_modify(sql, params)

def insert_student(student: Students):
    sql = """
        INSERT INTO public.students (
            user_id, firstname_parent, lastname_parent, email_parent, phone_parent,
            firstname_student, lastname_student, phone_student, created_at,
            main_subjects, additional_comments, address, has_physical_tutoring,
            postal_code, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        student.user_id, student.firstname_parent, student.lastname_parent,
        student.email_parent, student.phone_parent, student.firstname_student,
        student.lastname_student, student.phone_student, student.created_at,
        student.main_subjects or '', student.additional_comments or '',
        student.address, student.has_physical_tutoring, student.postal_code,
        student.is_active
    )
    execute_modify(sql, params)

def insert_new_student(new_student: NewStudents):
    sql = """
        INSERT INTO public.new_students (
            phone, has_called, called_at, has_answered, answered_at, has_signed_up,
            signed_up_at, from_referal, referee_phone, referee_name,
            has_assigned_teacher, assigned_teacher_at, has_finished_onboarding,
            finished_onboarding_at, comments, new_student_id, preffered_teacher,
            created_at, referee_account_number
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        new_student["phone"], new_student["has_called"], new_student["called_at"],
        new_student["has_answered"], new_student["answered_at"], new_student["has_signed_up"],
        new_student["signed_up_at"], new_student["from_referal"], new_student["referee_phone"],
        new_student["referee_name"], new_student["has_assigned_teacher"],
        new_student["assigned_teacher_at"], new_student["has_finished_onboarding"],
        new_student["finished_onboarding_at"], new_student["comments"],
        new_student["new_student_id"], new_student["preffered_teacher"],
        new_student["created_at"], new_student["referee_account_number"]
    )
    execute_modify(sql, params)

def insert_new_student_with_preferred_teacher(new_student: NewStudentWithPreferredTeacher):
    sql = """
        INSERT INTO public.new_students_with_preferred_teacher (
            new_student_id, phone, teacher_called, created_at, preferred_teacher,
            teacher_answered, student_signed_up, teacher_has_accepted, hidden,
            physical_or_digital, called_at, answered_at, signed_up_at,
            teacher_accepted_at, comments
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        new_student.new_student_id, new_student.phone, new_student.teacher_called,
        new_student.created_at, new_student.preferred_teacher,
        new_student.teacher_answered, new_student.student_signed_up,
        new_student.teacher_has_accepted, new_student.hidden,
        new_student.physical_or_digital, new_student.called_at,
        new_student.answered_at, new_student.signed_up_at,
        new_student.teacher_accepted_at, new_student.comments
    )
    execute_modify(sql, params)



# --- PSYCOPG2-BASED SQL IMPLEMENTATIONS ---
import uuid
from datetime import datetime, timezone

def insert_classes(classes: list[Classes]):
    # Validate teacher exists based on first class
    teacher_user_id = classes[0].teacher_user_id
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT user_id FROM public.teachers WHERE user_id = %s",
                (teacher_user_id,)
            )
            if not cur.fetchone():
                raise ValueError("Teacher does not exist")
            # Insert each class row
            for cls in classes:
                execute_modify(
                    """
                    INSERT INTO public.classes (
                        class_id, teacher_user_id, student_user_id,
                        created_at, started_at, ended_at, comment,
                        paid_teacher, invoiced_student, was_canselled,
                        groupclass, number_of_students
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        cls.class_id[0] if isinstance(cls.class_id, tuple) else cls.class_id,
                        cls.teacher_user_id,
                        cls.student_user_id,
                        cls.created_at,
                        cls.started_at,
                        cls.ended_at,
                        cls.comment,
                        cls.paid_teacher,
                        cls.invoiced_student,
                        cls.was_canselled,
                        cls.groupclass,
                        cls.number_of_students,
                    )
                )
    finally:
        conn.close()
    return True

def upsert_about_me_text(text: str, user_id: str, firstname: str, lastname: str):
    execute_modify(
        """
        INSERT INTO public.about_me_texts (
            user_id, about_me, firstname, lastname, created_at
        ) VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE
        SET about_me = EXCLUDED.about_me,
            firstname = EXCLUDED.firstname,
            lastname = EXCLUDED.lastname,
            created_at = EXCLUDED.created_at
        """,
        (user_id, text, firstname, lastname, datetime.now(timezone.utc))
    )

def insert_quiz_result(user_id: str, quiz_id: str, passed: bool,
                       number_of_corrects: int, number_of_questions: int):
    execute_modify(
        """
        INSERT INTO public.quiz_results (
            user_id, quiz_id, passed, number_of_corrects,
            number_of_questions, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            user_id, quiz_id, passed,
            number_of_corrects, number_of_questions,
            datetime.now(timezone.utc)
        )
    )

def insert_review(student_user_id: str, teacher_user_id: str,
                  rating: int, comment: str, name: str):
    row_id = str(uuid.uuid4())
    execute_modify(
        """
        INSERT INTO public.reviews (
            id, teacher_user_id, student_user_id,
            student_name, rating, comment, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            row_id, teacher_user_id, student_user_id,
            name, rating, comment,
            datetime.now(timezone.utc)
        )
    )

def insert_quiz(title: str, content: str, image_path: str,
                extension: str, pass_threshold: int,
                number_of_questions: int):
    # Upload to GCS (reuse existing upload_image function)
    quiz_id = str(uuid.uuid4())
    image_url = upload_image(title, quiz_id, image_path, extension)
    execute_modify(
        """
        INSERT INTO public.quizzes (
            quiz_id, title, content, image,
            pass_threshold, number_of_questions, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            quiz_id, title, content, image_url,
            pass_threshold, number_of_questions,
            datetime.now(timezone.utc)
        )
    )
    return quiz_id


import uuid
from datetime import datetime, timezone
from psycopg2.extras import execute_values
from google.cloud import storage

def upload_image(image_title: str, quiz_id: str, image_path: str, extension: str):
    storage_client = storage.Client()
    bucket_name = "enkellaering_images"
    destination_blob_name = f"quiz_images/{quiz_id}/{image_title.replace(' ', '_')}{extension}"

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    try:
        blob.upload_from_filename(image_path)
    except Exception as e:
        raise Exception(f"Error uploading image to bucket: {e}")

    return f"https://storage.googleapis.com/{bucket_name}/{destination_blob_name}"

def insert_quiz_questions(questions: list[dict]):
    # Bulk insert quiz questions into public.questions
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO public.questions (
                    quiz_id, question_id, question, options,
                    correct_option, time_limit, image
                ) VALUES %s
            """
            values = [
                (
                    q["quiz_id"], q["question_id"], q["question"],
                    q["options"], q["correct_option"],
                    q["time_limit"], q.get("image")
                )
                for q in questions
            ]
            execute_values(cur, sql, values)
        conn.commit()
    finally:
        conn.close()
    return True

def insert_new_student_order(
    student_user_id: str,
    teacher_user_id: str,
    accept: bool,
    physical_or_digital: bool,
    location: str,
    comments: str
):
    row_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    execute_modify(
        """
        INSERT INTO public.teacher_student (
            row_id, student_user_id, teacher_user_id,
            teacher_accepted_student, physical_or_digital,
            preferred_location, order_comments, created_at, hidden
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            row_id, student_user_id, teacher_user_id,
            accept, physical_or_digital, location,
            comments, created_at, False
        )
    )
    return True

def add_teacher_to_new_student(
    student_user_id: str,
    teacher_user_id: str,
    admin_user_id: str
):
    # Ensure admin exists
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT user_id FROM public.teachers WHERE user_id = %s AND admin = TRUE",
                (admin_user_id,)
            )
            if not cur.fetchone():
                raise ValueError("Admin teacher does not exist or is not admin")
        # Insert the teacher_student record
        row_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)
        execute_modify(
            """
            INSERT INTO public.teacher_student (
                row_id, teacher_user_id, student_user_id,
                teacher_accepted_student, created_at, hidden, order_comments
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                row_id, teacher_user_id, student_user_id,
                True, created_at, False, ""
            )
        )
    finally:
        conn.close()
    return True

import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from google.cloud import storage

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

def hide_new_student(row_id: str, admin_user_id: str):
    sql = """
        UPDATE public.teacher_student ts
        SET hidden = TRUE
        WHERE ts.row_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s AND t.admin = TRUE
          )
    """
    return execute_modify(sql, (row_id, admin_user_id))

def hide_new_order_from_new_students_table(new_student_id: str, admin_user_id: str):
    sql = """
        UPDATE public.new_students ns
        SET hidden = TRUE
        WHERE ns.new_student_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers t
              WHERE t.user_id = %s AND t.admin = TRUE
          )
    """
    return execute_modify(sql, (new_student_id, admin_user_id))

def delete_class(teacher_user_id: str, class_id: str):
    sql = """
        DELETE FROM public.classes
        WHERE class_id = %s AND teacher_user_id = %s
    """
    return execute_modify(sql, (class_id, teacher_user_id))

def delete_review(student_user_id: str, teacher_user_id: str):
    sql = """
        DELETE FROM public.reviews
        WHERE student_user_id = %s AND teacher_user_id = %s
    """
    return execute_modify(sql, (student_user_id, teacher_user_id))

def remove_teacher_from_student(teacher_user_id: str, student_user_id: str, admin_user_id: str):
    sql = """
        UPDATE public.teacher_student
        SET hidden = TRUE
        WHERE teacher_user_id = %s AND student_user_id = %s
            AND EXISTS (
                SELECT 1 FROM public.teachers t
                WHERE t.user_id = %s AND t.admin = TRUE
            )
    """
    return execute_modify(sql, (teacher_user_id, student_user_id, admin_user_id))

def delete_folder_from_bucket(storage_client, quiz_id: str, bucket_name: str = "enkellaering_images"):
    bucket = storage_client.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=f"quiz_images/{quiz_id}/")
    for blob in blobs:
        blob.delete()
    return True

def delete_quizzes(admin_user_id: str, quiz_ids: list[str]):
    # Verify admin rights
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT admin FROM public.teachers WHERE user_id = %s",
                (admin_user_id,)
            )
            row = cur.fetchone()
            if not row or not row.get("admin"):
                return False
    finally:
        conn.close()

    for quiz_id in quiz_ids:
        execute_modify("DELETE FROM public.quiz_results WHERE quiz_id = %s", (quiz_id,))
        execute_modify("DELETE FROM public.questions WHERE quiz_id = %s", (quiz_id,))
        execute_modify("DELETE FROM public.quizzes WHERE quiz_id = %s", (quiz_id,))
        storage_client = storage.Client()
        delete_folder_from_bucket(storage_client, quiz_id)
    return True

def hide_old_orders(days_old: int):
    sql = """
        UPDATE public.teacher_student
        SET hidden = TRUE
        WHERE created_at < NOW() - (%s * INTERVAL '1 day')
          AND (teacher_accepted_student IS NULL OR teacher_accepted_student = FALSE)
    """
    return execute_modify(sql, (days_old,))
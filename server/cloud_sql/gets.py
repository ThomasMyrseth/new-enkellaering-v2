import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_USER_PASSWORD")

def get_connection():
    print(f"Using DB HOST: {DB_HOST}")
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def execute_query(sql, params=None):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params or ())
            return cur.fetchall()
    finally:
        conn.close()

def get_all_teachers():
    sql = "SELECT * FROM public.teachers WHERE resigned = FALSE"
    return execute_query(sql)

def get_all_students(admin_user_id: str):
    sql = """
        SELECT * FROM public.students
        WHERE EXISTS (
            SELECT 1 FROM public.teachers
            WHERE user_id = %s AND admin = TRUE
        )
    """
    return execute_query(sql, (admin_user_id,))

def get_teacher_by_user_id(user_id: str):
    sql = "SELECT * FROM public.teachers WHERE user_id = %s"
    return execute_query(sql, (user_id,))

def get_student_by_user_id(user_id: str):
    sql = "SELECT * FROM public.students WHERE user_id = %s"
    return execute_query(sql, (user_id,))

def get_all_referrals(admin_user_id: str):
    sql = """
        SELECT * FROM public.referrals
        WHERE EXISTS (
            SELECT 1 FROM public.teachers
            WHERE user_id = %s AND admin = TRUE
        )
    """
    return execute_query(sql, (admin_user_id,))

def get_referral_by_user_id(admin_user_id: str, target_referee_user_id: str):
    sql = """
        SELECT * FROM public.referrals
        WHERE referee_user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers
              WHERE user_id = %s AND admin = TRUE
          )
    """
    return execute_query(sql, (target_referee_user_id, admin_user_id))

def get_all_new_students(admin_user_id: str):
    sql = """
        SELECT * FROM public.new_students
        WHERE EXISTS (
            SELECT 1 FROM public.teachers
            WHERE user_id = %s AND admin = TRUE
        )
    """
    return execute_query(sql, (admin_user_id,))

def get_all_students_without_teacher(admin_user_id: str):
    sql = """
        SELECT s.* FROM public.students s
        LEFT JOIN public.teacher_student ts
            ON s.user_id = ts.student_user_id
        LEFT JOIN public.teachers t
            ON ts.teacher_user_id = t.user_id
        WHERE t.user_id = %s AND t.admin = TRUE
          AND s.user_id NOT IN (
              SELECT student_user_id FROM public.teacher_student
              WHERE teacher_accepted_student = TRUE
                AND (hidden = FALSE OR hidden IS NULL)
          )
    """
    return execute_query(sql, (admin_user_id,))

def get_new_orders_for_teacher(teacher_user_id: str):
    sql = """
        SELECT ts.*, s.*, t.* 
        FROM public.teacher_student ts
        JOIN public.students s ON ts.student_user_id = s.user_id
        JOIN public.teachers t ON ts.teacher_user_id = t.user_id
        WHERE ts.teacher_user_id = %s
          AND ts.teacher_accepted_student IS NULL
          AND (ts.hidden IS NULL OR ts.hidden = FALSE)
    """
    return execute_query(sql, (teacher_user_id,))

def get_new_student_by_phone(phone: str):
    sql = "SELECT * FROM public.new_students WHERE phone = %s"
    return execute_query(sql, (phone,))

def get_all_classes(admin_user_id: str):
    sql = """
        SELECT * FROM public.classes
        WHERE EXISTS (
            SELECT 1 FROM public.teachers
            WHERE user_id = %s AND admin = TRUE
        )
    """
    return execute_query(sql, (admin_user_id,))

def get_class_by_teacher_and_student_id(admin_user_id: str, teacher_user_id: str, student_user_id: str):
    sql = """
        SELECT * FROM public.classes
        WHERE teacher_user_id = %s
          AND student_user_id = %s
          AND EXISTS (
              SELECT 1 FROM public.teachers
              WHERE user_id = %s AND admin = TRUE
          )
    """
    return execute_query(sql, (teacher_user_id, student_user_id, admin_user_id))

def get_classes_by_teacher(user_id: str):
    sql = "SELECT * FROM public.classes WHERE teacher_user_id = %s"
    return execute_query(sql, (user_id,))

def get_student_for_teacher(teacher_user_id: str):
    sql = """
        SELECT DISTINCT s.* FROM public.students s
        JOIN public.teacher_student ts ON s.user_id = ts.student_user_id
        WHERE ts.teacher_user_id = %s
          AND ts.teacher_accepted_student = TRUE
          AND (ts.hidden IS NULL OR ts.hidden != TRUE)
    """
    return execute_query(sql, (teacher_user_id,))

def get_student_by_email(email: str):
    sql = "SELECT * FROM public.students WHERE email_parent = %s"
    return execute_query(sql, (email,))

def get_teacher_by_email(email: str):
    sql = "SELECT * FROM public.teachers WHERE email = %s"
    return execute_query(sql, (email,))

def get_teacher_for_student(student_user_id: str):
    sql = """
        SELECT t.* FROM public.teachers t
        JOIN public.teacher_student ts ON t.user_id = ts.teacher_user_id
        WHERE ts.student_user_id = %s
          AND ts.teacher_accepted_student = TRUE
          AND (ts.hidden IS NULL OR ts.hidden != TRUE)
    """
    return execute_query(sql, (student_user_id,))

def get_classes_for_student(student_user_id: str):
    sql = """
        SELECT c.*, t.* FROM public.classes c
        JOIN public.teachers t ON c.teacher_user_id = t.user_id
        WHERE c.student_user_id = %s
    """
    return execute_query(sql, (student_user_id,))

def get_classes_for_teacher(teacher_user_id: str):
    sql = "SELECT * FROM public.classes WHERE teacher_user_id = %s"
    return execute_query(sql, (teacher_user_id,))

def get_about_me_text(user_id: str):
    sql = "SELECT about_me FROM public.about_me_texts WHERE user_id = %s"
    return execute_query(sql, (user_id,))

def get_all_about_me_texts():
    sql = "SELECT user_id, about_me, firstname, lastname FROM public.about_me_texts"
    return execute_query(sql)

def get_all_quizzes():
    sql = "SELECT * FROM public.quizzes"
    return execute_query(sql)

def get_quiz_meta_data(quiz_id: str):
    sql = "SELECT * FROM public.quizzes WHERE quiz_id = %s"
    return execute_query(sql, (quiz_id,))

def get_quiz(quiz_id: str):
    sql = "SELECT * FROM public.questions WHERE quiz_id = %s"
    return execute_query(sql, (quiz_id,))

        
def get_quiz_status(user_id: str):
    quizzes = execute_query("SELECT * FROM public.quizzes")
    results = execute_query(
        "SELECT * FROM public.quiz_results WHERE user_id = %s",
        (user_id,)
    )
    status = []
    for quiz in quizzes:
        match = next((r for r in results if r["quiz_id"] == quiz["quiz_id"]), {})
        status.append({"quiz": quiz, "result": match})
    return status

def get_all_reviews():
    sql = "SELECT * FROM public.reviews"
    return execute_query(sql)

def is_user_admin(user_id: str):
    rows = execute_query(
        "SELECT admin FROM public.teachers WHERE user_id = %s",
        (user_id,)
    )
    return bool(rows and rows[0].get("admin"))

def get_all_qualifications():
    sql = """
        SELECT qr.*, q.* 
        FROM public.quizzes q
        LEFT JOIN public.quiz_results qr
          ON qr.quiz_id = q.quiz_id
    """
    return execute_query(sql)

def get_new_orders(student_user_id: str):
    sql = """
        SELECT ts.*, t.* 
        FROM public.teacher_student ts
        JOIN public.teachers t 
          ON t.user_id = ts.teacher_user_id
        WHERE ts.student_user_id = %s
          AND (ts.teacher_accepted_student IS NULL OR ts.teacher_accepted_student = FALSE)
          AND (ts.hidden IS NULL OR ts.hidden = FALSE)
    """
    return execute_query(sql, (student_user_id,))

def get_teacher_student():
    sql = "SELECT * FROM public.teacher_student WHERE hidden IS NULL OR hidden = FALSE"
    return execute_query(sql)

from datetime import datetime, timedelta, timezone
def get_students_with_few_classes(days: int):
    threshold_date = (datetime.now(timezone.utc) - timedelta(days=days)).date()
    sql = """
        SELECT s.*, ts.*, t.*, 
               lc.started_at AS last_class_started_at, 
               lc.class_id AS last_class_id
        FROM public.students s
        JOIN public.teacher_student ts 
          ON s.user_id = ts.student_user_id
        JOIN public.teachers t 
          ON t.user_id = ts.teacher_user_id
        LEFT JOIN (
            SELECT * FROM (
                SELECT *,
                       ROW_NUMBER() OVER (
                         PARTITION BY student_user_id 
                         ORDER BY started_at DESC
                       ) AS rn
                FROM public.classes
            ) c
            WHERE rn = 1
        ) lc 
          ON lc.student_user_id = s.user_id
        WHERE s.user_id NOT IN (
            SELECT student_user_id 
            FROM public.classes 
            WHERE started_at::date > %s
        )
          AND s.is_active = TRUE
          AND ts.row_id = (
              SELECT MIN(row_id) 
              FROM public.teacher_student 
              GROUP BY student_user_id
          )
    """
    return execute_query(sql, (threshold_date,))

def get_all_admins():
    sql = "SELECT * FROM public.teachers WHERE admin = TRUE"
    return execute_query(sql)

def get_all_teachers_join_students():
    sql = """
        SELECT * 
        FROM public.students s
        LEFT JOIN public.teacher_student ts 
          ON s.user_id = ts.student_user_id
        LEFT JOIN public.teachers t 
          ON t.user_id = ts.teacher_user_id
        WHERE (t.resigned = FALSE OR t.resigned IS NULL)
          AND (ts.teacher_accepted_student = TRUE OR ts.teacher_accepted_student IS NULL)
          AND (ts.hidden = FALSE OR ts.hidden IS NULL)
    """
    return execute_query(sql)

def get_students_without_teacher():
    sql = """
        SELECT * 
        FROM public.students s
        WHERE s.user_id NOT IN (
            SELECT student_user_id 
            FROM public.teacher_student
            WHERE teacher_accepted_student = TRUE 
              AND (hidden = FALSE OR hidden IS NULL)
        )
    """
    return execute_query(sql)


def get_teachers_without_about_me():
    sql = """
        SELECT t.user_id, t.firstname, t.lastname, t.email
        FROM public.teachers AS t
        WHERE t.user_id NOT IN (
            SELECT user_id 
            FROM public.about_me_texts
        )
            AND t.resigned = FALSE
    """
    return execute_query(sql)
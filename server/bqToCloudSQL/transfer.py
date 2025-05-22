import psycopg2
import json

# Connection details
DB_NAME = 'enkel_laering'
DB_USER = 'enkel-laering-db-user'
DB_PASSWORD = '18826E22-5F73-4327-A8BE-61F733AF46F4'
DB_HOST = '127.0.0.1'
DB_PORT = 5432

print("Connecting to Cloud SQL...")

# Connect to Cloud SQL
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
    print("Connection successful.")
except Exception as e:
    print("Failed to connect to Cloud SQL:", e)
    exit(1)

# Delete existing rows
cur.execute("DELETE FROM public.about_me_texts")
cur.execute("DELETE FROM public.classes")
cur.execute("DELETE FROM public.new_students")
cur.execute("DELETE FROM public.questions")
cur.execute("DELETE FROM public.quiz_results")
cur.execute("DELETE FROM public.quizzes")
cur.execute("DELETE FROM public.reviews")
cur.execute("DELETE FROM public.students")
cur.execute("DELETE FROM public.teacher_student")
cur.execute("DELETE FROM public.teachers")

# --- about_me_texts ---
with open("abot_me_texts.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.about_me_texts (
            user_id, about_me, firstname, lastname, created_at
        ) VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO NOTHING
    """, (
        row['user_id'],
        row.get('about_me'),
        row.get('firstname'),
        row.get('lastname'),
        row.get('created_at')
    ))
conn.commit()
print("Inserted about_me_texts")

# --- classes ---
with open("classes.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.classes (
            class_id, teacher_user_id, student_user_id, created_at,
            started_at, ended_at, comment, paid_teacher,
            invoiced_student, was_canselled, invoiced_student_at,
            paid_teacher_at, groupclass
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (class_id) DO NOTHING
    """, (
        row['class_id'],
        row['teacher_user_id'],
        row['student_user_id'],
        row.get('created_at'),
        row.get('started_at'),
        row.get('ended_at'),
        row.get('comment'),
        row.get('paid_teacher') == "true",
        row.get('invoiced_student') == "true",
        (row.get('was_canselled') or row.get('was_cancelles')) == "true",
        row.get('invoiced_student_at'),
        row.get('paid_teacher_at'),
        row.get('groupclass') == "true"
    ))
conn.commit()
print("Inserted classes")

# --- new_students ---
with open("new_students.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.new_students (
            new_student_id, phone, has_called, created_at, called_at,
            has_answered, answered_at, has_signed_up, signed_up_at,
            from_referal, referee_phone, has_assigned_teacher,
            assigned_teacher_at, assigned_teacher_user_id,
            has_finished_onboarding, finished_onboarding_at, comments,
            paid_referee, paid_referee_at, referee_name, hidden,
            preffered_teacher, referee_account_number
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (new_student_id) DO NOTHING
    """, (
        row['new_student_id'],
        row.get('phone'),
        row.get('has_called') == "true",
        row.get('created_at'),
        row.get('called_at'),
        row.get('has_answered') == "true",
        row.get('answered_at'),
        row.get('has_signed_up') == "true",
        row.get('signed_up_at'),
        row.get('from_referal') == "true",
        row.get('referee_phone'),
        row.get('has_assigned_teacher') == "true",
        row.get('assigned_teacher_at'),
        row.get('assigned_teacher_user_id'),
        row.get('has_finished_onboarding') == "true",
        row.get('finished_onboarding_at'),
        row.get('comments'),
        row.get('paid_referee') == "true" if row.get('paid_referee') else None,
        row.get('paid_referee_at'),
        row.get('referee_name'),
        row.get('hidden') == "true",
        row.get('preffered_teacher'),
        row.get('referee_account_number')
    ))
conn.commit()
print("Inserted new_students")

# --- questions ---
with open("questions.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.questions (
            question_id, quiz_id, question, answer_options,
            correct_option, image, time_limit, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (question_id) DO NOTHING
    """, (
        row['question_id'],
        row['quiz_id'],
        row['question'],
        row['options'],
        int(row['correct_option']),
        row.get('image'),
        int(row['time_limit']),
        row.get('created_at')
    ))
conn.commit()
print("Inserted questions")

# --- quiz_results ---
with open("quiz_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.quiz_results (
            user_id, quiz_id, passed, number_of_corrects,
            number_of_questions, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id, quiz_id) DO NOTHING
    """, (
        row['user_id'],
        row['quiz_id'],
        row['passed'] == "true",
        int(row['number_of_corrects']),
        int(row['number_of_questions']),
        row.get('created_at')
    ))
conn.commit()
print("Inserted quiz_results")

# --- quizzes ---
with open("quizzes.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.quizzes (
            quiz_id, title, image, pass_threshold,
            created_at, number_of_questions, content
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (quiz_id) DO NOTHING
    """, (
        row['quiz_id'],
        row['title'],
        row.get('image'),
        float(row['pass_threshold']),
        row.get('created_at'),
        int(row['number_of_questions']) if row.get('number_of_questions') else None,
        row.get('content')
    ))
conn.commit()
print("Inserted quizzes")

# --- reviews ---
with open("reviews.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.reviews (
            id, teacher_user_id, student_user_id, student_name,
            created_at, rating, comment
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING
    """, (
        row['id'],
        row.get('teacher_user_id'),
        row.get('student_user_id'),
        row.get('student_name'),
        row.get('created_at'),
        int(row['rating']) if row.get('rating') else None,
        row.get('comment')
    ))
conn.commit()
print("Inserted reviews")

# --- students ---
with open("students.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.students (
            user_id, created_at, firstname_parent, lastname_parent,
            email_parent, phone_parent, firstname_student, lastname_student,
            phone_student, address, postal_code, main_subjects,
            has_physical_tutoring, additional_comments, est_hours_per_week,
            is_active, notes
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO NOTHING
    """, (
        row['user_id'],
        row.get('created_at'),
        row.get('firstname_parent'),
        row.get('lastname_parent'),
        row.get('email_parent'),
        row.get('phone_parent'),
        row.get('firstname_student'),
        row.get('lastname_student'),
        row.get('phone_student'),
        row.get('address'),
        row.get('postal_code'),
        row.get('main_subjects'),
        row.get('has_physical_tutoring') == "true",
        row.get('additional_comments'),
        float(row['est_hours_per_week']) if row.get('est_hours_per_week') else None,
        row.get('is_active') == "true",
        row.get('notes')
    ))
conn.commit()
print("Inserted students")

# --- teacher_student ---
with open("teacher_student.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.teacher_student (
            row_id, teacher_user_id, student_user_id, teacher_accepted_student,
            physical_or_digital, preferred_location, created_at, hidden,
            order_comments, travel_pay_to_teacher, travel_pay_from_student
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (row_id) DO NOTHING
    """, (
        row['row_id'],
        row.get('teacher_user_id'),
        row.get('student_user_id'),
        row.get('teacher_accepted_student') == "true",
        row.get('physical_or_digital') == "true",
        row.get('preferred_location'),
        row.get('created_at'),
        row.get('hidden') == "true",
        row.get('order_comments'),
        float(row['travel_pay_to_teacher']) if row.get('travel_pay_to_teacher') else None,
        float(row['travel_pay_from_student']) if row.get('travel_pay_from_student') else None
    ))
conn.commit()
print("Inserted teacher_student")

# --- teachers ---
with open("teachers.json", "r", encoding="utf-8") as f:
    data = json.load(f)
for row in data:
    cur.execute("""
        INSERT INTO public.teachers (
            user_id, firstname, lastname, email, phone,
            address, postal_code, hourly_pay, additional_comments,
            created_at, admin, resigned, resigned_at, location,
            digital_tutouring, physical_tutouring
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO NOTHING
    """, (
        row['user_id'],
        row.get('firstname'),
        row.get('lastname'),
        row.get('email'),
        row.get('phone'),
        row.get('address'),
        row.get('postal_code'),
        row.get('hourly_pay'),
        row.get('additional_comments'),
        row.get('created_at'),
        row.get('admin') == "true",
        row.get('resigned') == "true",
        row.get('resigned_at'),
        row.get('location'),
        row.get('digital_tutouring') == "true",
        row.get('physical_tutouring') == "true"
    ))
conn.commit()
print("Inserted teachers")

cur.close()
conn.close()
print("All data inserted and connection closed.")
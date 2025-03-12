from google.cloud import bigquery
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')
QUIZ_DATASET = os.getenv('QUIZ_DATASET')






def get_all_teachers(client: bigquery.Client):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
    """
    return client.query(query)


def get_all_students(client: bigquery.Client, admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.students`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)


def get_teacher_by_user_id(client: bigquery.Client, user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
    WHERE user_id = @user_id
    """
    query_params = [
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)

    response = client.query(query, job_config=job_config)

    return response.result()


def get_all_students(client: bigquery.Client, admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.students`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)

def get_student_by_user_id(client: bigquery.Client, user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.students`
    WHERE user_id = @user_id
    """
    query_params = [
        bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)

    return client.query(query, job_config=job_config)

def get_all_referrals(client: bigquery.Client, admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.referrals`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE admin_user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_referral_by_user_id(client: bigquery.Client, admin_user_id: str, target_referee_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.referrals`
    WHERE referee_user_id = @target_referee_user_id
      AND EXISTS (
          SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
          WHERE admin_user_id = @admin_user_id AND admin = TRUE
      )
    """
    query_params = [
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        bigquery.ScalarQueryParameter("target_referee_user_id", "STRING", target_referee_user_id),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_all_new_students(client: bigquery.Client, admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.new_students`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config, location='EU')


def get_all_new_students_with_preferred_teacher(client: bigquery.Client, teacher_user_id: str):
    query = f"""
    SELECT * 
    FROM `{PROJECT_ID}.{USER_DATASET}.teacher_student` AS ts
    JOIN `{PROJECT_ID}.{USER_DATASET}.students`AS s
    ON ts.student_user_id = s.user_id
    WHERE ts.teacher_user_id = @teacher_user_id
    """
    query_params = [bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    
    try:
        response = client.query(query, job_config=job_config)
        results = response.result()

        
        if not response or response.errors:
            print(f"Error fetching new students {response.errors}")
            raise(Exception(f"Error fetching new students {response.errors}"))
        
        formatted_data = []
        for row in results:
            formatted_data.append({
                "student": {
                    "user_id": row.user_id,
                    "firstname_parent": row.firstname_parent,
                    "lastname_parent": row.lastname_parent,
                    "email_parent": row.email_parent,
                    "phone_parent": row.phone_parent,
                    "firstname_student": row.firstname_student,
                    "lastname_student": row.lastname_student,
                    "phone_student": row.phone_student,
                    "address": row.address,
                    "postal_code": row.postal_code,
                    "main_subjects": row.main_subjects,
                    "has_physical_tutoring": row.has_physical_tutoring,
                    "additional_comments": row.additional_comments,
                    "est_hours_per_week": row.est_hours_per_week,
                    #"your_teacher": row.your_teacher,
                    "is_active": row.is_active,
                    "wants_more_students": row.wants_more_students,
                    "notes": row.notes,
                    "created_at": row.created_at
                },
                "order": {
                    "row_id": row.row_id,
                    "teacher_user_id": row.teacher_user_id,
                    "student_user_id": row.student_user_id,
                    "teacher_accepted_student": row.teacher_accepted_student,
                    "physical_or_digital": row.physical_or_digital,
                    "preferred_location": row.preferred_location,
                    "created_at": row.created_at,
                    "hidden": row.hidden
                }
            })

        return formatted_data

    except Exception as e:
        raise RuntimeError(f"Error getting students with preferred teacher: {e}")

def get_new_student_by_phone(client: bigquery.Client, phone: str):
    print("phone: ", phone)

    query = f"""
    SELECT * FROM new_students.new_students
    WHERE phone = @phone
    """
    query_params = [
        bigquery.ScalarQueryParameter("phone", "STRING", phone),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)

def get_all_classes(client: bigquery.Client, admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{CLASSES_DATASET}.classes`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)

def get_class_by_teacher_and_student_id(client: bigquery.Client, admin_user_id: str, teacher_user_id: str, student_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{CLASSES_DATASET}.classes`
    WHERE teacher_user_id = @teacher_user_id AND student_user_id = @student_user_id
      AND EXISTS (
          SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
          WHERE admin_user_id = @admin_user_id AND admin = TRUE
      )
    """
    query_params = [
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id),
        bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_classes_by_teacher(client: bigquery.Client, user_id: str):
    query = f"""
        SELECT *
        FROM {CLASSES_DATASET}.classes
        WHERE teacher_user_id = @user_id
    """

    query_params = [bigquery.ScalarQueryParameter("user_id", "STRING", user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()


def get_student_for_teacher(client :bigquery.Client, teacher_user_id: str):
    query = f"""
            SELECT *
            FROM {USER_DATASET}.students AS s
            JOIN {USER_DATASET}.teacher_student AS ts
            ON s.user_id = ts.student_user_id
            WHERE teacher_user_id = @teacher_user_id
            AND ts.teacher_accepted_student = TRUE
        """
    
    query_params = [bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config, location='EU').result()

def get_student_by_email(client: bigquery.Client, email):
    # Check if user already exists
    query = f"SELECT * FROM `{USER_DATASET}.students` WHERE email_parent = @Email"
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("Email", "STRING", email)]
    )
    results = list(client.query(query, job_config=job_config))

    if len(results)==0:
        return []
    
    return results

def get_teacher_by_email(client: bigquery.Client, email):
    query = f"SELECT * FROM `{USER_DATASET}.teachers` WHERE email = @Email"
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("Email", "STRING", email)]
    )
    results = list(client.query(query, job_config=job_config, location='EU'))

    if len(results)==0:
        return []
    
    return results

def get_teacher_for_student(client: bigquery.Client, student_user_id):
    query = f"""
        SELECT teachers.*
        FROM {USER_DATASET}.teachers
        JOIN {USER_DATASET}.students 
        ON teachers.user_id = students.your_teacher
        WHERE students.user_id = @student_user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id)]
    )

    return client.query(query, job_config=job_config)

def get_classes_for_student(client: bigquery.Client, student_user_id):
    query = f"""
        SELECT *
        FROM {CLASSES_DATASET}.classes
        WHERE student_user_id = @student_user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id)]
    )

    return client.query(query, job_config=job_config)


def get_classes_for_teacher(client :bigquery.Client, teacher_user_id):
    query = f"""
        SELECT *
        FROM {CLASSES_DATASET}.classes
        WHERE teacher_user_id = @teacher_user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id)]
    )

    return client.query(query, job_config=job_config)

def get_about_me_text(client: bigquery.Client, user_id :str):
    
    query = f"""
        SELECT about_me 
        FROM`{PROJECT_ID}.{USER_DATASET}.about_me_texts
        WHERE user_id=@user_id
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )

    return client.query(query, job_config=job_config, location="EU")


def get_all_about_me_texts(client: bigquery.Client):
    """
    Fetches all "about me" texts from the BigQuery table.
    Returns a list of dictionaries.
    """
    query = f"""
        SELECT user_id, about_me, firstname, lastname 
        FROM `{PROJECT_ID}.{USER_DATASET}.about_me_texts`
    """

    query_job = client.query(query, location="EU")
    results = query_job.result()  # Fetch all rows

    about_me_texts = [{"user_id": row["user_id"], "about_me": row["about_me"], "firstname" : row["firstname"], "lastname" : row["lastname"]} for row in results]
    return about_me_texts






def get_all_quizzes(client: bigquery.Client):
    query = f"""
        SELECT * 
        FROM `{PROJECT_ID}.{QUIZ_DATASET}.quizzes`
    """

    query_job = client.query(query, location="EU")
    results = query_job.result()  # Fetch all rows

    formatted_quizzes = []
    for row in results:
        quiz_id = row["quiz_id"]
        title = row["title"]
        image = row["image"]
        pass_threshold = row["pass_threshold"]
        created_at = row["created_at"]

        formatted_quizzes.append({"quiz_id": quiz_id, "title": title, "image": image,"pass_threshold": pass_threshold, "created_at": created_at})

    return formatted_quizzes
        


def get_quiz_meta_data(quiz_id :str, client: bigquery.Client):
    query = f"""
        SELECT * 
        FROM `{PROJECT_ID}.{QUIZ_DATASET}.quizzes`
        WHERE quiz_id = @quiz_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("quiz_id", "STRING", quiz_id)]
    )

    query_job = client.query(query, location="EU", job_config=job_config)
    results = list(query_job.result())  # Fetch all rows

    quiz_data = dict(results[0])

    return quiz_data
        


def get_quiz(quiz_id :str, client: bigquery.Client):
    query = f"""
        SELECT * 
        FROM `{PROJECT_ID}.{QUIZ_DATASET}.questions`
        WHERE quiz_id = @quiz_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("quiz_id", "STRING", quiz_id)]
    )

    query_job = client.query(query, job_config=job_config)
    results = query_job.result()  # Fetch all rows

    formated_questions = []
    for row in results:
        question_id = row["question_id"]
        question = row["question"]
        options = row["options"]
        correct_option = row["correct_option"]
        time_limit = row["time_limit"]
        image = row["image"]

        formated_questions.append({
            "quiz_id": quiz_id,
            "question_id": question_id,
            "question": question,
            "options": options,
            "correct_option": correct_option,
            "time_limit": time_limit,
            "image": image
        })

    return formated_questions

        


def get_quiz_status(user_id :str, client: bigquery.Client):

    #1 get all the quizzes
    quiz_query = f"""
        SELECT * 
        FROM `{PROJECT_ID}.{QUIZ_DATASET}.quizzes`
    """

    quiz_query_job = client.query(quiz_query, location="EU")


    #2 get all of the users attempts
    quiz_results_query=f"""
        SELECT * 
        FROM `{PROJECT_ID}.{USER_DATASET}.quiz_results`
        WHERE user_id = @user_id
        """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("user_id", "STRING", user_id)]
    )

    quiz_results_query_job = client.query(quiz_results_query, location="EU", job_config=job_config)

    quizzes = [dict(row) for row in quiz_query_job.result()]
    quiz_results = [dict(row) for row in quiz_results_query_job.result()]


    
    #3 JOIN the data based
    joined_data = []

    for quiz in quizzes:

        potensial_quiz_result = {}
        for quiz_result in quiz_results:
            if (quiz_result["quiz_id"] == quiz["quiz_id"]):
                potensial_quiz_result = quiz_result

        joined_data.append({"quiz": quiz, "result": potensial_quiz_result})

    return joined_data


def get_all_reviews(client: bigquery.Client):
    if not client:
        raise ValueError("BigQuery client is required")

    query = f"""
        SELECT *
        FROM `{USER_DATASET}.reviews`
    """

    try:
        res = client.query(query).result()
        rows = [dict(row) for row in res]  # Convert each row to a dictionary
        return rows
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return []
    

def is_user_admin(client: bigquery.Client, user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
    WHERE user_id = @user_id
    """
    query_params = [bigquery.ScalarQueryParameter("user_id", "STRING", user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)

    try:
        response = client.query(query, job_config=job_config)
        results = list(response.result())  # Convert iterator to list
        
        if not results:
            return False
        
        row =  dict(results[0])  # Convert first row to dictionary

        return row["admin"] or False

    except Exception as e:
        print(f"Error fetching teacher: {e}")
        return False
    

def get_all_qualifications(bq_client :bigquery.Client):

    query = f"""
        SELECT *
        FROM `{USER_DATASET}.quiz_results` AS qr
        JOIN `{QUIZ_DATASET}.quizzes` AS q
        ON qr.quiz_id = q.quiz_id
    """

    response = bq_client.query(query)
    try:
        data = response.result()
        print("data: ", data)
        formatted_data = [] 
        for row in data:
            user_id = row["user_id"]
            quiz_id = row["quiz_id"]
            passed = row["passed"]
            number_of_corrects = row["number_of_corrects"]
            number_of_questions = row["number_of_questions"]
            created_at = row["created_at"]
            title = row["title"]
            image = row["image"]
            pass_threshold = row["pass_threshold"]
            content = row["content"]

            f = {
                "user_id": user_id,
                "quiz_id": quiz_id,
                "passed": passed,
                "number_of_corrects": number_of_corrects,
                "number_of_questions": number_of_questions,
                "created_at": created_at,
                "title": title,
                "image": image,
                "pass_threshold": pass_threshold,
                "content": content
            }

            formatted_data.append(f)

        return formatted_data
    
    except Exception as e:
        print(f"Error fetching qualifications: {e}")
        raise(f"Error getting qualifications {e}")
    


def get_new_orders(student_user_id :str, client: bigquery.Client):
    query = f"""
        SELECT *
        FROM `{USER_DATASET}.teacher_student` AS ts
        JOIN `{USER_DATASET}.teachers` AS t
        ON t.user_id = ts.teacher_user_id
        WHERE student_user_id = @student_user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id)
        ]
    )

    try:
        response = client.query(query, job_config=job_config)
        results = response.result()
        
        formatted_data = []
        for row in results:
            formatted_data.append({
                "teacher": {
                    "user_id": row.user_id,
                    "firstname": row.firstname,
                    "lastname": row.lastname,
                    "email": row.email,
                    "phone": row.phone,
                    "address": row.address,
                    "postal_code": row.postal_code,
                    "hourly_pay": row.hourly_pay,
                    "resigned": row.resigned,
                    "additional_comments": row.additional_comments,
                    "created_at": row.created_at,
                    "admin": row.admin,
                    "resigned_at": row.resigned_at
                },
                "order": {
                    "row_id": row.row_id,
                    "teacher_user_id": row.teacher_user_id,
                    "student_user_id": row.student_user_id,
                    "teacher_accepted_student": row.teacher_accepted_student,
                    "physical_or_digital": row.physical_or_digital,
                    "preferred_location": row.preferred_location,
                    "created_at": row.created_at,
                    "hidden": row.hidden
                }
            })
        
        return formatted_data
    
    except Exception as e:
        raise RuntimeError(f"Error getting teacher orders: {e}")

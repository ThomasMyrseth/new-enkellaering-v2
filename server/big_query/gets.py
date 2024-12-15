from google.cloud import bigquery
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')




def get_all_teachers(client: bigquery.Client, admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

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
        WHERE admin_user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

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
        WHERE admin_user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_new_student_by_phone(client: bigquery.Client, admin_user_id: str, phone: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.new_students`
    WHERE phone = @phone
      AND EXISTS (
          SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
          WHERE admin_user_id = @admin_user_id AND admin = TRUE
      )
    """
    query_params = [
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        bigquery.ScalarQueryParameter("phone", "STRING", phone),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

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
            FROM {USER_DATASET}.students
            WHERE your_teacher=@teacher_user_id
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

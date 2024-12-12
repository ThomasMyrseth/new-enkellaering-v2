from google.cloud import bigquery
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()
client = bigquery.Client()


PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')




def get_all_teachers(admin_user_id: str):
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

def get_teacher_by_user_id(admin_user_id: str, target_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
    WHERE admin_user_id = @target_user_id
      AND EXISTS (
          SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
          WHERE admin_user_id = @admin_user_id AND admin = TRUE
      )
    """
    query_params = [
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        bigquery.ScalarQueryParameter("target_user_id", "STRING", target_user_id),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_all_students(admin_user_id: str):
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

def get_student_by_user_id(admin_user_id: str, target_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{USER_DATASET}.students`
    WHERE user_id = @target_user_id
      AND EXISTS (
          SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
          WHERE admin_user_id = @admin_user_id AND admin = TRUE
      )
    """
    query_params = [
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        bigquery.ScalarQueryParameter("target_user_id", "STRING", target_user_id),
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_all_referrals(admin_user_id: str):
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

def get_referral_by_user_id(admin_user_id: str, target_referee_user_id: str):
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

def get_all_new_students(admin_user_id: str):
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

def get_new_student_by_phone(admin_user_id: str, phone: str):
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

def get_all_classes(admin_user_id: str):
    query = f"""
    SELECT * FROM `{PROJECT_ID}.{CLASSES_DATASET}.classes`
    WHERE EXISTS (
        SELECT 1 FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE admin_user_id = @admin_user_id AND admin = TRUE
    )
    """
    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config).result()

def get_class_by_teacher_and_student_id(admin_user_id: str, teacher_user_id: str, student_user_id: str):
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
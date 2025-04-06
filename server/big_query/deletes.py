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


def hideNewStudent(row_id, admin_user_id, client=None):

    if not client:
        client = bigquery.Client.from_service_account_json('google_service_account.json')
    query = f"""
        UPDATE `{USER_DATASET}.teacher_student`
        SET hidden = TRUE
        WHERE
            row_id = @row_id
            AND EXISTS (
                SELECT 1
                FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
                WHERE user_id = @admin_user_id
                AND admin = TRUE
            )
    """

    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
                    bigquery.ScalarQueryParameter("row_id", "STRING", row_id)]
    
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)




def hideNewOrderFromNewStudentsTable(new_student_id, admin_user_id, client=None):

    if not client:
        client = bigquery.Client.from_service_account_json('google_service_account.json')
    query = f"""
        UPDATE `{NEW_STUDENTS_DATASET}.new_students`
        SET hidden = TRUE
        WHERE
            new_student_id = @new_student_id
            AND EXISTS (
                SELECT 1
                FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
                WHERE user_id = @admin_user_id
                AND admin = TRUE
            )
    """

    query_params = [bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
                    bigquery.ScalarQueryParameter("new_student_id", "STRING", new_student_id)]
    
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)


def delete_review(student_user_id: str, teacher_user_id: str, bq_client=None):
    if bq_client is None:
        raise ValueError("BigQuery client is required")

    query = f"""
        DELETE FROM `{USER_DATASET}.reviews`
        WHERE student_user_id = @student_user_id AND teacher_user_id = @teacher_user_id
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
            bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id),
        ]
    )

    try:
        response = bq_client.query(query, job_config=job_config, location="EU")
        response.result()  # Wait for query to complete
        return True
    except Exception as e:
        print(f"Error executing delete query: {e}")
        raise Exception(f"Error deleting old review {e}")
    

def removeTeacherFromStudent(teacher_user_id :str, student_user_id :str, client=None):

    if not client:
        client = bigquery.Client.from_service_account_json('google_service_account.json')
    query = f"""
        UPDATE `{USER_DATASET}.teacher_student`
        SET hidden = TRUE
        WHERE teacher_user_id = @teacher_user_id
        AND student_user_id = @student_user_id
    """

    query_params = [bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id),
                    bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id)]
    
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    return client.query(query, job_config=job_config)



from google.cloud import bigquery, storage
from big_query.gets import is_user_admin
from typing import List

def delete_quizzes(admin_user_id: str, quiz_ids: List[str], bq_client=None):
    if bq_client is None:
        raise ValueError("BigQuery client is required")
    
    # Check if the user is admin
    try:
        res = is_user_admin(client=bq_client, user_id=admin_user_id)
        if not res:
            return False
    except Exception as e:
        print(f"Error verifying admin status: {e}")
        return False

    # Define delete queries
    delete_quiz_query = f"""
        DELETE FROM `{QUIZ_DATASET}.quizzes`
        WHERE quiz_id = @quiz_id
    """

    delete_questions_query = f"""
        DELETE FROM `{QUIZ_DATASET}.questions`
        WHERE quiz_id = @quiz_id
    """

    delete_answers_query = f"""
        DELETE FROM `{USER_DATASET}.quiz_results`
        WHERE quiz_id = @quiz_id
    """

    deleted_count = 0  # Track successful deletions

    try:
        for quiz_id in quiz_ids:
            query_params = [bigquery.ScalarQueryParameter("quiz_id", "STRING", quiz_id)]
            job_config = bigquery.QueryJobConfig(query_parameters=query_params)

            # Execute all delete queries
            for query in [delete_answers_query, delete_questions_query, delete_quiz_query]:
                response = bq_client.query(query, job_config=job_config, location="EU")
                response.result()  # Ensure the query completes

            deleted_count += 1  # Increment success counter
    
    except Exception as e:
        print(f"Error executing delete query: {e}")
        raise Exception(f"Error deleting quizzes: {e}")
    

    #delete the folder in the bucket named quiz_id
    storage_client = storage.Client()
    try: 
        delete_folder_from_bucket(storage_client=storage_client, quiz_id=quiz_id)
    
    except Exception as e:
        raise Exception(f"Error deleting from bucket {e}")
    
    return True, f"{deleted_count} quizzes deleted successfully"

def delete_folder_from_bucket(storage_client, quiz_id: str, bucket_name = 'enkellaering_images'):
    """Deletes all objects in a bucket folder (prefix) named after the quiz_id."""
    bucket = storage_client.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=f"quiz_images/{quiz_id}/")  # Prefix ensures we delete only within the folder

    try:
        for blob in blobs:
            blob.delete()  # Delete each file in the folder
        return True
    except Exception as e:
        return False
    

def hideOldOrders(daysOld: int, client: bigquery.Client):
    query = f"""
        UPDATE `{USER_DATASET}.teacher_student`
        SET hidden = TRUE
        WHERE created_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @daysOld DAY)
    """
    query_params = [
        bigquery.ScalarQueryParameter("daysOld", "INT64", daysOld)
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    try:
        query_job = client.query(query, job_config=job_config, location="EU")
        query_job.result()  # Wait for the query to complete
        return True, "Old orders hidden successfully"
    except Exception as e:
        print(f"Error executing hideOldOrders: {e}")
        raise Exception(f"Error hiding old orders: {e}")
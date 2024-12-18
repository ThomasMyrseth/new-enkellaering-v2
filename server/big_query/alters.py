from google.cloud import bigquery
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


def alterNewStudent(client: bigquery.Client, new_student_id: str, admin_user_id: str, updates: dict):

    print("new student id: ", new_student_id)
    print("updates: \n", updates)

    query = f"""
        UPDATE `new_students.new_students`
        SET
            has_called = @has_called,
            called_at = @called_at,
            has_answered = @has_answered,
            answered_at = @answered_at,
            has_signed_up = @has_signed_up,
            signed_up_at = @signed_up_at,
            from_referal = @from_referal,
            referee_phone = @referee_phone,
            has_assigned_teacher = @has_assigned_teacher,
            assigned_teacher_at = @assigned_teacher_at,
            assigned_teacher_user_id = @assigned_teacher_user_id,
            has_finished_onboarding = @has_finished_onboarding,
            finished_onboarding_at = @finished_onboarding_at,
            comments = @comments,
            paid_referee = @paid_referee,
            paid_referee_at = @paid_referee_at
        WHERE new_student_id = @new_student_id
            AND EXISTS (
                SELECT 1
                FROM `{USER_DATASET}.teachers`
                WHERE user_id = @admin_user_id
            )
        """
    
    # Prepare query parameters using ScalarQueryParameter
    params = [
        bigquery.ScalarQueryParameter("has_called", "BOOL", updates.get("has_called")),
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        bigquery.ScalarQueryParameter("called_at", "TIMESTAMP", updates.get("called_at")),
        bigquery.ScalarQueryParameter("has_answered", "BOOL", updates.get("has_answered")),
        bigquery.ScalarQueryParameter("answered_at", "TIMESTAMP", updates.get("answered_at")),
        bigquery.ScalarQueryParameter("has_signed_up", "BOOL", updates.get("has_signed_up")),
        bigquery.ScalarQueryParameter("signed_up_at", "TIMESTAMP", updates.get("signed_up_at")),
        bigquery.ScalarQueryParameter("from_referal", "BOOL", updates.get("from_referal")),
        bigquery.ScalarQueryParameter("referee_phone", "STRING", updates.get("referee_phone")),
        bigquery.ScalarQueryParameter("has_assigned_teacher", "BOOL", updates.get("has_assigned_teacher")),
        bigquery.ScalarQueryParameter("assigned_teacher_at", "TIMESTAMP", updates.get("assigned_teacher_at")),
        bigquery.ScalarQueryParameter("assigned_teacher_user_id", "STRING", updates.get("assigned_teacher_user_id")),
        bigquery.ScalarQueryParameter("has_finished_onboarding", "BOOL", updates.get("has_finished_onboarding")),
        bigquery.ScalarQueryParameter("finished_onboarding_at", "TIMESTAMP", updates.get("finished_onboarding_at")),
        bigquery.ScalarQueryParameter("comments", "STRING", updates.get("comments")),
        bigquery.ScalarQueryParameter("paid_referee", "BOOL", updates.get("paid_referee")),
        bigquery.ScalarQueryParameter("paid_referee_at", "TIMESTAMP", updates.get("paid_referee_at")),
    ]

    # Configure the query job
    job_config = bigquery.QueryJobConfig(query_parameters=params)

    # Execute the query
    return client.query(query, job_config=job_config)


def setClassesToInvoiced(client: bigquery.Client, class_ids: list, admin_user_id: str):
    query = f"""
        UPDATE `{CLASSES_DATASET}.classes`
        SET
            invoiced_student = TRUE,
            invoiced_student_at = CURRENT_TIMESTAMP()
        WHERE class_id IN UNNEST(@class_ids)
        AND EXISTS (
            SELECT 1
            FROM `{USER_DATASET}.teachers`
            WHERE user_id = @admin_user_id
        )"""

    # Define query parameters
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ArrayQueryParameter("class_ids", "STRING", class_ids),
            bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        ]
    )

    # Run the query
    return client.query(query, job_config=job_config, location='EU')
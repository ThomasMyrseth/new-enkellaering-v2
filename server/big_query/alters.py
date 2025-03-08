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
        bigquery.ScalarQueryParameter("new_student_id", "STRING", new_student_id)
    ]

    # Configure the query job
    job_config = bigquery.QueryJobConfig(query_parameters=params)

    # Execute the query
    return client.query(query, job_config=job_config)

def setHasSignedUp(client :bigquery.Client, phone: str):

    query = f"""
        UPDATE `new_students.new_students`
        SET
            has_signed_up = @has_signed_up,
            signed_up_at = CURRENT_TIMESTAMP()
        WHERE phone = @phone
    """

    params = [ bigquery.ScalarQueryParameter("has_signed_up", "BOOL", True),
               bigquery.ScalarQueryParameter("phone", "STRING", phone)]
    
    job_config = bigquery.QueryJobConfig(query_parameters=params)

    return client.query(query, job_config=job_config)

def setYourTeacher(client :bigquery.Client, phone: str, your_teacher :str):

    query = f"""
        UPDATE `users.students`
        SET
            your_teacher = @your_teacher
        WHERE phone_parent = @phone
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("your_teacher", "STRING", your_teacher),
            bigquery.ScalarQueryParameter("phone", "STRING", phone)
        ]
    )

    return client.query(query, job_config=job_config)

def setYourTeacherByuserId (client: bigquery.Client, student_user_id: str, teacher_user_id: str, admin_user_id :str):
    query = f"""
        UPDATE `{USER_DATASET}.students`
        SET
            your_teacher = @your_teacher
        WHERE user_id = @user_id
        AND EXISTS (
            SELECT 1
            FROM `{USER_DATASET}.teachers`
            WHERE user_id = @admin_user_id
        )"""
    
    params = [ bigquery.ScalarQueryParameter("your_teacher", "STRING", teacher_user_id),
               bigquery.ScalarQueryParameter("user_id", "STRING", student_user_id),
               bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)
            ]
    
    job_config = bigquery.QueryJobConfig(query_parameters=params)

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


def setClassesToPaid(client: bigquery.Client, class_ids: list, admin_user_id: str):
    query = f"""
        UPDATE `{CLASSES_DATASET}.classes`
        SET
            paid_teacher = TRUE,
            paid_teacher_at = CURRENT_TIMESTAMP()
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





def setStudentToInactive(client: bigquery.Client, student_user_id: str, admin_user_id: str):
    query = f"""
        UPDATE `{USER_DATASET}.students`
        SET
            is_active = FALSE
        WHERE user_id = @student_user_id
        AND EXISTS (
            SELECT 1
            FROM `{USER_DATASET}.teachers`
            WHERE user_id = @admin_user_id
        )"""

    # Define query parameters
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
            bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        ]
    )

    # Run the query
    return client.query(query, job_config=job_config, location='EU')




def setStudentToActive(client: bigquery.Client, student_user_id: str, admin_user_id: str):
    query = f"""
        UPDATE `{USER_DATASET}.students`
        SET
            is_active = TRUE
        WHERE user_id = @student_user_id
        AND EXISTS (
            SELECT 1
            FROM `{USER_DATASET}.teachers`
            WHERE user_id = @admin_user_id
        )"""

    # Define query parameters
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
            bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id),
        ]
    )

    # Run the query
    return client.query(query, job_config=job_config, location='EU')





def toggleWantMoreStudents(client: bigquery.Client, wants_more_students :bool, teacher_user_id: str):
    query = f"""
        UPDATE `{USER_DATASET}.teachers`
        SET
            wants_more_students = @wants_more_students
        WHERE user_id = @teacher_user_id
    """

    # Define query parameters
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("wants_more_students", "BOOL", wants_more_students),
            bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id),
        ]
    )

    # Run the query
    return client.query(query, job_config=job_config, location='EU')




def updateStudentNotes(admin_user_id :str, student_user_id :str, notes: str, client: bigquery.Client):
    print("admin user id: ", admin_user_id)
    print("student", student_user_id)
    print("notes", notes)
    
    query = f"""
        UPDATE `{USER_DATASET}.students`
        SET
            notes = @notes
        WHERE user_id = @student_user_id
         AND EXISTS (
            SELECT 1
            FROM `{USER_DATASET}.teachers`
            WHERE user_id = @admin_user_id
        )
    """

    # Define query parameters
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("notes", "STRING", notes),
            bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
            bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)
        ]
    )

    # Run the query
    return client.query(query, job_config=job_config, location='EU')





def alterNewStudentWithPreferredTeacher(client: bigquery.Client, new_student_id: str, teacher_user_id :str, updates: dict):
    query = f"""
        UPDATE `{NEW_STUDENTS_DATASET}.new_students_with_preferred_teacher`
        SET
            teacher_called = @teacher_called,
            called_at = @called_at,
            teacher_answered = @teacher_answered,
            answered_at = @answered_at,
            teacher_has_accepted = @teacher_has_accepted,
            teacher_accepted_at = @teacher_accepted_at,
            comments = @comments
        WHERE new_student_id = @new_student_id
        AND preferred_teacher= @teacher_user_id
    """
    params = [
        bigquery.ScalarQueryParameter("teacher_called", "BOOL", updates.get("teacher_called")),
        bigquery.ScalarQueryParameter("called_at", "TIMESTAMP", updates.get("called_at")),
        bigquery.ScalarQueryParameter("teacher_answered", "BOOL", updates.get("teacher_answered")),
        bigquery.ScalarQueryParameter("answered_at", "TIMESTAMP", updates.get("answered_at")),
        bigquery.ScalarQueryParameter("teacher_has_accepted", "BOOL", updates.get("teacher_has_accepted")),
        bigquery.ScalarQueryParameter("teacher_accepted_at", "TIMESTAMP", updates.get("teacher_accepted_at")),
        bigquery.ScalarQueryParameter("comments", "STRING", updates.get("comments")),
        bigquery.ScalarQueryParameter("new_student_id", "STRING", new_student_id),
        bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id)
    ]
    job_config = bigquery.QueryJobConfig(query_parameters=params)
    return client.query(query, job_config=job_config)
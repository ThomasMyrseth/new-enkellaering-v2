from google.cloud import bigquery
from typing import Optional
from datetime import datetime
from big_query.bq_types import teachers, students, classes, new_students, referrals
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()
client = bigquery.Client()


PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')


def insert_teacher(client: bigquery.Client, teacher: teachers):
    query = f"""
        INSERT INTO `{PROJECT_ID}.{USER_DATASET}.TEACHERS` (
            firstname, lastname, email, phone, address, postal_code, hourly_pay, resigned,
            created_at, admin, your_teacher, is_active, deactivated_at
        )
        VALUES (
            @firstname, @lastname, @email, @phone, @address, @postal_code, @hourly_pay, @resigned,
            @created_at, @admin, @your_teacher, @is_active, @deactivated_at
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("firstname", "STRING", teacher.firstname),
            bigquery.ScalarQueryParameter("lastname", "STRING", teacher.lastname),
            bigquery.ScalarQueryParameter("email", "STRING", teacher.email),
            bigquery.ScalarQueryParameter("phone", "STRING", teacher.phone),
            bigquery.ScalarQueryParameter("address", "STRING", teacher.address),
            bigquery.ScalarQueryParameter("postal_code", "STRING", teacher.postal_code),
            bigquery.ScalarQueryParameter("hourly_pay", "STRING", teacher.hourly_pay),
            bigquery.ScalarQueryParameter("resigned", "BOOL", teacher.resigned),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", teacher.created_at),
            bigquery.ScalarQueryParameter("admin", "BOOL", teacher.admin),
            bigquery.ScalarQueryParameter("your_teacher", "STRING", teacher.your_teacher),
            bigquery.ScalarQueryParameter("is_active", "BOOL", teacher.is_active),
            bigquery.ScalarQueryParameter("deactivated_at", "TIMESTAMP", teacher.deactivated_at),
        ]
    )
    client.query(query, job_config=job_config)


def insert_student(client: bigquery.Client, student: students):
    query = f"""
        INSERT INTO `{PROJECT_ID}.{USER_DATASET}.STUDENTS` (
            firstname_parent, lastname_parent, email_parent, phone_parent,
            firstname_student, lastname_student, phone_student, created_at,
            main_subjects, additional_comments
        )
        VALUES (
            @firstname_parent, @lastname_parent, @email_parent, @phone_parent,
            @firstname_student, @lastname_student, @phone_student, @created_at,
            @main_subjects, @additional_comments
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("firstname_parent", "STRING", student.firstname_parent),
            bigquery.ScalarQueryParameter("lastname_parent", "STRING", student.lastname_parent),
            bigquery.ScalarQueryParameter("email_parent", "STRING", student.email_parent),
            bigquery.ScalarQueryParameter("phone_parent", "STRING", student.phone_parent),
            bigquery.ScalarQueryParameter("firstname_student", "STRING", student.firstname_student),
            bigquery.ScalarQueryParameter("lastname_student", "STRING", student.lastname_student),
            bigquery.ScalarQueryParameter("phone_student", "STRING", student.phone_student),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", student.created_at),
            bigquery.ScalarQueryParameter("main_subjects", "STRING", student.main_subjects),
            bigquery.ScalarQueryParameter("additional_comments", "STRING", student.additional_comments),
        ]
    )
    client.query(query, job_config=job_config)


def insert_referral(client: bigquery.Client, referral: referrals):
    # Check for matching student to populate referee_user_id
    referee_query = f"""
        SELECT user_id FROM `{PROJECT_ID}.{USER_DATASET}.STUDENTS`
        WHERE phone_student = @referral_student_phone OR phone_parent = @referral_parent_phone
    """
    referee_job = client.query(
        referee_query,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("referral_student_phone", "STRING", referral.referral_student_phone),
                bigquery.ScalarQueryParameter("referral_parent_phone", "STRING", referral.referral_parent_phone),
            ]
        ),
    )
    referee_result = list(referee_job.result())
    referee_user_id = referee_result[0]["user_id"] if referee_result else None

    query = f"""
        INSERT INTO `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.REFERRALS` (
            referral_student_phone, referral_parent_phone, referee_phone,
            referee_user_id, paid_referee, success, paid_referee_at, success_at
        )
        VALUES (
            @referral_student_phone, @referral_parent_phone, @referee_phone,
            @referee_user_id, @paid_referee, @success, @paid_referee_at, @success_at
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("referral_student_phone", "STRING", referral.referral_student_phone),
            bigquery.ScalarQueryParameter("referral_parent_phone", "STRING", referral.referral_parent_phone),
            bigquery.ScalarQueryParameter("referee_phone", "STRING", referral.referee_phone),
            bigquery.ScalarQueryParameter("referee_user_id", "STRING", referee_user_id),
            bigquery.ScalarQueryParameter("paid_referee", "BOOL", referral.paid_referee),
            bigquery.ScalarQueryParameter("success", "BOOL", referral.success),
            bigquery.ScalarQueryParameter("paid_referee_at", "TIMESTAMP", referral.paid_referee_at),
            bigquery.ScalarQueryParameter("success_at", "TIMESTAMP", referral.success_at),
        ]
    )
    client.query(query, job_config=job_config)


def insert_new_student(client: bigquery.Client, new_student: new_students):
    query = f"""
        INSERT INTO `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.NEW_STUDENTS` (
            phone, has_called, called_at, has_answered, answered_at, has_signed_up, signed_up_at,
            from_referral, referee_phone, has_assigned_teacher, assigned_teacher_at,
            has_finished_onboarding, finished_onboarding_at, comments
        )
        VALUES (
            @phone, @has_called, @called_at, @has_answered, @answered_at, @has_signed_up, @signed_up_at,
            @from_referral, @referee_phone, @has_assigned_teacher, @assigned_teacher_at,
            @has_finished_onboarding, @finished_onboarding_at, @comments
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("phone", "STRING", new_student.phone),
            bigquery.ScalarQueryParameter("has_called", "BOOL", new_student.has_called),
            bigquery.ScalarQueryParameter("called_at", "TIMESTAMP", new_student.called_at),
            bigquery.ScalarQueryParameter("has_answered", "BOOL", new_student.has_answered),
            bigquery.ScalarQueryParameter("answered_at", "TIMESTAMP", new_student.answered_at),
            bigquery.ScalarQueryParameter("has_signed_up", "BOOL", new_student.has_signed_up),
            bigquery.ScalarQueryParameter("signed_up_at", "TIMESTAMP", new_student.signed_up_at),
            bigquery.ScalarQueryParameter("from_referral", "BOOL", new_student.from_referral),
            bigquery.ScalarQueryParameter("referee_phone", "STRING", new_student.referee_phone),
            bigquery.ScalarQueryParameter("has_assigned_teacher", "BOOL", new_student.has_assigned_teacher),
            bigquery.ScalarQueryParameter("assigned_teacher_at", "TIMESTAMP", new_student.assigned_teacher_at),
            bigquery.ScalarQueryParameter("has_finished_onboarding", "BOOL", new_student.has_finished_onboarding),
            bigquery.ScalarQueryParameter("finished_onboarding_at", "TIMESTAMP", new_student.finished_onboarding_at),
            bigquery.ScalarQueryParameter("comments", "STRING", new_student.comments),
        ]
    )
    client.query(query, job_config=job_config)


def insert_class(client: bigquery.Client, class_: classes):
    # Validate teacher exists
    teacher_query = f"""
        SELECT user_id FROM `{PROJECT_ID}.{USER_DATASET}.TEACHERS`
        WHERE user_id = @teacher_user_id
    """
    teacher_job = client.query(
        teacher_query,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("teacher_user_id", "STRING", class_.teacher_user_id)
            ]
        ),
    )
    teacher_result = list(teacher_job.result())
    if not teacher_result:
        raise ValueError("Teacher does not exist")

    query = f"""
        INSERT INTO `{PROJECT_ID}.{USER_DATASET}.CLASSES` (
            teacher_user_id, student_user_id, created_at, started_at, ended_at,
            comment, paid_teacher, invoiced_student
        )
        VALUES (
            @teacher_user_id, @student_user_id, @created_at, @started_at, @ended_at,
            @comment, @paid_teacher, @invoiced_student
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("teacher_user_id", "STRING", class_.teacher_user_id),
            bigquery.ScalarQueryParameter("student_user_id", "STRING", class_.student_user_id),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", class_.created_at),
            bigquery.ScalarQueryParameter("started_at", "TIMESTAMP", class_.started_at),
            bigquery.ScalarQueryParameter("ended_at", "TIMESTAMP", class_.ended_at),
            bigquery.ScalarQueryParameter("comment", "STRING", class_.comment),
            bigquery.ScalarQueryParameter("paid_teacher", "BOOL", class_.paid_teacher),
            bigquery.ScalarQueryParameter("invoiced_student", "BOOL", class_.invoiced_student),
        ]
    )
    client.query(query, job_config=job_config)
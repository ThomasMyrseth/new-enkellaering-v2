from google.cloud import bigquery
from big_query.bq_types import Teachers, Students, Referrals, NewStudents, Classes
from dotenv import load_dotenv
import os
from datetime import datetime, timezone

# Load environment variables from .env file
load_dotenv()
client = bigquery.Client.from_service_account_json('google_service_account.json')


PROJECT_ID = os.getenv('PROJECT_ID')
USER_DATASET = os.getenv('USER_DATASET')
CLASSES_DATASET = os.getenv('CLASSES_DATASET')
NEW_STUDENTS_DATASET = os.getenv('NEW_STUDENTS_DATASET')
QUIZ_DATASET = os.getenv('QUIZ_DATASET')


def insert_teacher(client: bigquery.Client, teacher: Teachers):
    query = f"""
        INSERT INTO `{USER_DATASET}.teachers` (
            user_id,
            firstname,
            lastname,
            email,
            phone,
            address,
            postal_code,
            hourly_pay,
            resigned,
            additional_comments,
            created_at,
            admin,
            resigned_at,
            wants_more_students
        )
        VALUES (
            @user_id,
            @firstname,
            @lastname,
            @email,
            @phone,
            @address,
            @postal_code,
            @hourly_pay,
            @additional_comments,
            @created_at,
            @admin,
            @resigned,
            @resigned_at,
            TRUE
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", teacher.user_id),
            bigquery.ScalarQueryParameter("firstname", "STRING", teacher.firstname),
            bigquery.ScalarQueryParameter("lastname", "STRING", teacher.lastname),
            bigquery.ScalarQueryParameter("email", "STRING", teacher.email),
            bigquery.ScalarQueryParameter("phone", "STRING", teacher.phone),
            bigquery.ScalarQueryParameter("address", "STRING", teacher.address),
            bigquery.ScalarQueryParameter("postal_code", "STRING", teacher.postal_code),
            bigquery.ScalarQueryParameter("hourly_pay", "STRING", teacher.hourly_pay),
            bigquery.ScalarQueryParameter("additional_comments", "STRING", teacher.additional_comments),    
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", teacher.created_at),
            bigquery.ScalarQueryParameter("admin", "BOOL", teacher.admin),
            bigquery.ScalarQueryParameter("resigned", "BOOL", teacher.resigned),
            bigquery.ScalarQueryParameter("resigned_at", "TIMESTAMP", teacher.resigned_at),
        ]
    )
    response =  client.query(query, job_config=job_config, location='EU')
    print(response.result())


def insert_student(client: bigquery.Client, student: Students):
    query = f"""
        INSERT INTO `{USER_DATASET}.students` (
            user_id, firstname_parent, lastname_parent, email_parent, phone_parent,
            firstname_student, lastname_student, phone_student, created_at,
            main_subjects, additional_comments, address, has_physical_tutoring,
            postal_code
        )
        VALUES (
            @user_id, @firstname_parent, @lastname_parent, @email_parent, @phone_parent,
            @firstname_student, @lastname_student, @phone_student, @created_at,
            @main_subjects, @additional_comments, @address, @has_physical_tutoring,
            @postal_code
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", student.user_id),
            bigquery.ScalarQueryParameter("firstname_parent", "STRING", student.firstname_parent),
            bigquery.ScalarQueryParameter("lastname_parent", "STRING", student.lastname_parent),
            bigquery.ScalarQueryParameter("email_parent", "STRING", student.email_parent),
            bigquery.ScalarQueryParameter("phone_parent", "STRING", student.phone_parent),
            bigquery.ScalarQueryParameter("firstname_student", "STRING", student.firstname_student),
            bigquery.ScalarQueryParameter("lastname_student", "STRING", student.lastname_student),
            bigquery.ScalarQueryParameter("phone_student", "STRING", student.phone_student),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", student.created_at),
            bigquery.ScalarQueryParameter("main_subjects", "STRING", student.main_subjects or ''),
            bigquery.ScalarQueryParameter("additional_comments", "STRING", student.additional_comments or '' ),
            bigquery.ScalarQueryParameter("address", "STRING", student.address),
            bigquery.ScalarQueryParameter("postal_code", "STRING", student.postal_code),
            bigquery.ScalarQueryParameter("has_physical_tutoring", "BOOL", student.has_physical_tutoring),
        ]
    )

    try:
        response = client.query(query, job_config=job_config, location='EU')
        print("response: ", response.result())
        print(f"Student {student.user_id} inserted successfully.")
    except Exception as e:
        print(f"Error inserting student {student.user_id}: {e}")
        raise e


def insert_referral(client: bigquery.Client, referral: Referrals):
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


def insert_new_student(client: bigquery.Client, new_student: NewStudents):


    query = f"""
        INSERT INTO `{PROJECT_ID}.{NEW_STUDENTS_DATASET}.new_students` (
            phone, has_called, called_at, has_answered, answered_at, has_signed_up, signed_up_at,
            from_referal, referee_phone, referee_name, has_assigned_teacher, assigned_teacher_at,
            has_finished_onboarding, finished_onboarding_at, comments, new_student_id, preffered_teacher, created_at
        )
        VALUES (
            @phone, @has_called, @called_at, @has_answered, @answered_at, @has_signed_up, @signed_up_at,
            @from_referal, @referee_phone, @referee_name, @has_assigned_teacher, @assigned_teacher_at,
            @has_finished_onboarding, @finished_onboarding_at, @comments, @new_student_id, @preffered_teacher, @created_at
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
            bigquery.ScalarQueryParameter("from_referal", "BOOL", new_student.from_referal),
            bigquery.ScalarQueryParameter("referee_phone", "STRING", new_student.referee_phone),
            bigquery.ScalarQueryParameter("referee_name", "STRING", new_student.referee_name),
            bigquery.ScalarQueryParameter("has_assigned_teacher", "BOOL", new_student.has_assigned_teacher),
            bigquery.ScalarQueryParameter("assigned_teacher_at", "TIMESTAMP", new_student.assigned_teacher_at),
            bigquery.ScalarQueryParameter("has_finished_onboarding", "BOOL", new_student.has_finished_onboarding),
            bigquery.ScalarQueryParameter("finished_onboarding_at", "TIMESTAMP", new_student.finished_onboarding_at),
            bigquery.ScalarQueryParameter("comments", "STRING", new_student.comments),
            bigquery.ScalarQueryParameter("new_student_id", "STRING", new_student.new_student_id),
            bigquery.ScalarQueryParameter("preffered_teacher", "STRING", new_student.preffered_teacher),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", new_student.created_at),
        ]
    )
    
    return client.query(query, job_config=job_config, location='EU')




def insert_class(client: bigquery.Client, class_obj: Classes):
    # Validate teacher exists
    teacher_query = f"""
        SELECT user_id FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @teacher_user_id
    """
    teacher_job = client.query(
        teacher_query,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("teacher_user_id", "STRING", class_obj.teacher_user_id)
            ]
        ),
    )
    teacher_result = list(teacher_job.result())

    if not teacher_result:
        raise ValueError("Teacher does not exist")

    query = f"""
        INSERT INTO `{PROJECT_ID}.{CLASSES_DATASET}.classes` (
            class_id, teacher_user_id, student_user_id, created_at, started_at, ended_at,
            comment, paid_teacher, invoiced_student, was_canselled
        )
        VALUES (
            @class_id, @teacher_user_id, @student_user_id, @created_at, @started_at, @ended_at,
            @comment, @paid_teacher, @invoiced_student, @was_canselled
        )
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("class_id", "STRING", class_obj.class_id),
            bigquery.ScalarQueryParameter("teacher_user_id", "STRING", class_obj.teacher_user_id),
            bigquery.ScalarQueryParameter("student_user_id", "STRING", class_obj.student_user_id),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.fromisoformat(class_obj.created_at.replace("Z", "")).replace(tzinfo=timezone.utc)),
            bigquery.ScalarQueryParameter("started_at", "TIMESTAMP", datetime.fromisoformat(class_obj.started_at.replace("Z", "")).replace(tzinfo=timezone.utc)),
            bigquery.ScalarQueryParameter("ended_at", "TIMESTAMP", datetime.fromisoformat(class_obj.ended_at.replace("Z", "")).replace(tzinfo=timezone.utc)),
            bigquery.ScalarQueryParameter("comment", "STRING", class_obj.comment),
            bigquery.ScalarQueryParameter("paid_teacher", "BOOL", class_obj.paid_teacher),
            bigquery.ScalarQueryParameter("invoiced_student", "BOOL", class_obj.invoiced_student),
            bigquery.ScalarQueryParameter("was_canselled", "BOOL", class_obj.was_canselled),
        ]
    )

    try:
        response = client.query(query, job_config=job_config, location="EU")
        response.result()  # Ensure the query completes

        # Debug response
        print("Query executed successfully.")
        if response.errors:
            print("BigQuery errors:")
            for error in response.errors:
                print(error)
            raise Exception("Error inserting new class into BigQuery")
        
        return True
    except Exception as e:
        print(f"Error executing query: {e}")
        raise Exception(f"Error executing query: {e}")
    

def upsert_about_me_text(client: bigquery.Client, text: str, user_id: str, firstname: str, lastname: str):
    query = f"""
        MERGE `{PROJECT_ID}.{USER_DATASET}.about_me_texts` AS target
        USING (
            SELECT 
                @user_id AS user_id, 
                @about_me AS about_me, 
                @firstname AS firstname, 
                @lastname AS lastname,
                @created_at AS created_at
        ) AS source
        ON target.user_id = source.user_id
        WHEN MATCHED THEN
            UPDATE SET 
                about_me = source.about_me,
                firstname = source.firstname,
                lastname = source.lastname,
                created_at = source.created_at
        WHEN NOT MATCHED THEN
            INSERT (user_id, about_me, firstname, lastname, created_at)
            VALUES (source.user_id, source.about_me, source.firstname, source.lastname, source.created_at)
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
            bigquery.ScalarQueryParameter("about_me", "STRING", text),
            bigquery.ScalarQueryParameter("firstname", "STRING", firstname),
            bigquery.ScalarQueryParameter("lastname", "STRING", lastname),
            bigquery.ScalarQueryParameter("create_at", "TIMESTAMP", datetime.now(timezone.utc))
        ]
    )

    return client.query(query, job_config=job_config, location="EU")


def insert_quiz_result(user_id :str, quiz_id :str, passed :bool, number_of_corrects :int, number_of_questions :int, client :bigquery.Client):

    query = f"""
        INSERT INTO `{PROJECT_ID}.{USER_DATASET}.quiz_results`
        (user_id, quiz_id, passed, number_of_corrects, number_of_questions, created_at)
        VALUES (@user_id, @quiz_id, @passed, @number_of_corrects, @number_of_questions, CURRENT_TIMESTAMP())
    """


    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
            bigquery.ScalarQueryParameter("quiz_id", "STRING", quiz_id),
            bigquery.ScalarQueryParameter("passed", "BOOL", passed),
            bigquery.ScalarQueryParameter("number_of_corrects", "INT64", number_of_corrects),
            bigquery.ScalarQueryParameter("number_of_questions", "INT64", number_of_questions),
        ]
    )

    try:
        response = client.query(query, job_config=job_config, location="EU")
        response.result()  # Ensure the query completes

        # Debug response
        print("Query executed successfully.")
        if response.errors:
            print("BigQuery errors:")
            for error in response.errors:
                print(error)
            raise Exception("Error inserting new class into BigQuery")
        
        return True
    except Exception as e:
        print(f"Error executing query: {e}")
        raise Exception(f"Error executing query: {e}")



from uuid import uuid4
def insert_review(student_user_id :str, teacher_user_id :str, rating :int, comment :str, name :str, bq_client = None):
    row_id = str(uuid4())

    query = f"""
        INSERT INTO `{USER_DATASET}.reviews`
        (id, teacher_user_id, student_user_id, student_name, rating, comment, created_at)

        VALUES (@id, @teacher_user_id, @student_user_id, @student_name, @rating, @comment, CURRENT_TIMESTAMP())
    """


    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("id", "STRING", row_id),
            bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id),
            bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
            bigquery.ScalarQueryParameter("student_name", "STRING", name),
            bigquery.ScalarQueryParameter("rating", "INT64", rating),
            bigquery.ScalarQueryParameter("comment", "STRING", comment)
        ]
    )

    try:
        response = client.query(query, job_config=job_config, location="EU")
        response.result()  # Ensure the query completes

        # Debug response
        print("Query executed successfully.")
        if response.errors:
            print("BigQuery errors:")
            for error in response.errors:
                print(error)
            raise Exception("Error inserting new review into BigQuery")
        
        return True
    except Exception as e:
        print(f"Error executing query: {e}")
        raise Exception(f"Error executing query: {e}")
    



from uuid import uuid4
from google.cloud import storage

def insert_quiz(title :str, content: str, image_path :str,  extension :str, pass_treshold :int, number_of_questions :int, bq_client = None):
    
    if bq_client is None:
        bq_client = bigquery.Client.from_service_account_json("google_service_account.json")

    
    # Initialize GCS client
    storage_client = storage.Client()
    bucket_name = "enkellaering_images"
    destination_blob_name = f"quiz_covers/{title.replace(' ', '_')}{extension}"

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    try:
        blob.upload_from_filename(image_path)
    except Exception as e:
        raise Exception(f"Error uploading image to bucket: {e}")

    image_url = f"https://storage.googleapis.com/{bucket_name}/{destination_blob_name}"



    #2 insert the quiz metadata into the sql database

    quiz_id = str(uuid4())

    query = f"""
        INSERT INTO `{QUIZ_DATASET}.quizzes`
        (quiz_id, title, content, image, pass_threshold, number_of_questions, created_at)

        values (@quiz_id, @title, @content, @image, @pass_threshold, @number_of_questions, CURRENT_TIMESTAMP())

    """


    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("quiz_id", "STRING", quiz_id),
            bigquery.ScalarQueryParameter("title", "STRING", title),
            bigquery.ScalarQueryParameter("content", "STRING", content),
            bigquery.ScalarQueryParameter("image", "STRING", image_url),
            bigquery.ScalarQueryParameter("pass_threshold", "FLOAT", pass_treshold),
            bigquery.ScalarQueryParameter("number_of_questions", "INT64", number_of_questions)
        ]
    )

    try:
        response = client.query(query, job_config=job_config, location="EU")
        response.result()  # Ensure the query completes

        # Debug response
        if response.errors:
            raise Exception("Error inserting new review into BigQuery")
        
        return quiz_id #this is the URL of the quiz
    except Exception as e:
        print(f"Error executing query: {e}")
        raise Exception(f"Error executing query: {e}")
    

from uuid import uuid4
from google.cloud import storage

def upload_image(image_title :str, quiz_id :str, image_path :str,  extension :str):
    # Initialize GCS client
    storage_client = storage.Client()
    bucket_name = "enkellaering_images"
    destination_blob_name = f"quiz_images/{quiz_id}/{image_title.replace(' ', '_')}{extension}"

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    try:
        blob.upload_from_filename(image_path)
    except Exception as e:
        raise Exception(f"Error uploading image to bucket: {e}")

    image_url = f"https://storage.googleapis.com/{bucket_name}/{destination_blob_name}"

    return image_url

def insert_quiz_questions(questions :list, bq_client = None):

    if bq_client is None:
        bq_client = bigquery.Client.from_service_account_json("google_service_account.json")

    table_id = "quizzes.questions"

    errors = bq_client.insert_rows_json(table_id, questions)
    if errors:
        raise Exception("Batch insert failed")
    
    return True


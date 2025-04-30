from google.cloud import bigquery
from big_query.bq_types import Teacher, Students, Referrals, NewStudents, Classes
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


def insert_teacher(client: bigquery.Client, teacher: Teacher):
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
            wants_more_students,
            location,
            digital_tutouring,
            physical_tutouring
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
            @resigned,
            @additional_comments,
            @created_at,
            @admin,
            @resigned_at,
            @wants_more_students,
            @location,
            @digital_tutouring,
            @physical_tutouring
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
            bigquery.ScalarQueryParameter("resigned", "BOOL", teacher.resigned),
            bigquery.ScalarQueryParameter("additional_comments", "STRING", teacher.additional_comments),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", teacher.created_at),
            bigquery.ScalarQueryParameter("admin", "BOOL", teacher.admin),
            bigquery.ScalarQueryParameter("resigned_at", "TIMESTAMP", teacher.resigned_at),
            bigquery.ScalarQueryParameter("wants_more_students", "BOOL", True),
            bigquery.ScalarQueryParameter("location", "STRING", teacher.location),
            bigquery.ScalarQueryParameter("digital_tutouring", "BOOL", teacher.digital_tutouring),
            bigquery.ScalarQueryParameter("physical_tutouring", "BOOL", teacher.physical_tutouring),
        ]
    )
    response = client.query(query, job_config=job_config, location='EU')
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


def NOTINUSE_insert_referral(client: bigquery.Client, referral: Referrals):
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
            has_finished_onboarding, finished_onboarding_at, comments, new_student_id, preffered_teacher, created_at, referee_account_number
        )
        VALUES (
            @phone, @has_called, @called_at, @has_answered, @answered_at, @has_signed_up, @signed_up_at,
            @from_referal, @referee_phone, @referee_name, @has_assigned_teacher, @assigned_teacher_at,
            @has_finished_onboarding, @finished_onboarding_at, @comments, @new_student_id, @preffered_teacher, @created_at, @referee_account_number
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
            bigquery.ScalarQueryParameter("referee_account_number", "STRING", new_student.referee_account_number)
        ]
    )
    
    return client.query(query, job_config=job_config, location='EU')


from google.cloud import bigquery
from big_query.bq_types import NewStudentWithPreferredTeacher

def insert_new_student_with_preferred_teacher(client: bigquery.Client, new_student: NewStudentWithPreferredTeacher):
    query = f"""
        INSERT INTO `{NEW_STUDENTS_DATASET}.new_students_with_preferred_teacher` (
            new_student_id,
            phone,
            teacher_called,
            created_at,
            preferred_teacher,
            teacher_answered,
            student_signed_up,
            teacher_has_accepted,
            hidden,
            physical_or_digital,
            called_at,
            answered_at,
            signed_up_at,
            teacher_accepted_at,
            comments
        )
        VALUES (
            @new_student_id,
            @phone,
            @teacher_called,
            @created_at,
            @preferred_teacher,
            @teacher_answered,
            @student_signed_up,
            @teacher_has_accepted,
            @hidden,
            @physical_or_digital,
            @called_at,
            @answered_at,
            @signed_up_at,
            @teacher_accepted_at,
            @comments
        )
    """
    
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("new_student_id", "STRING", new_student.new_student_id),
            bigquery.ScalarQueryParameter("phone", "STRING", new_student.phone),
            bigquery.ScalarQueryParameter("teacher_called", "BOOL", new_student.teacher_called),
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", new_student.created_at),
            bigquery.ScalarQueryParameter("preferred_teacher", "STRING", new_student.preferred_teacher),
            bigquery.ScalarQueryParameter("teacher_answered", "BOOL", new_student.teacher_answered),
            bigquery.ScalarQueryParameter("student_signed_up", "BOOL", new_student.student_signed_up),
            bigquery.ScalarQueryParameter("teacher_has_accepted", "BOOL", new_student.teacher_has_accepted),
            bigquery.ScalarQueryParameter("hidden", "BOOL", new_student.hidden),
            bigquery.ScalarQueryParameter("physical_or_digital", "BOOL", new_student.physical_or_digital),
            bigquery.ScalarQueryParameter("called_at", "TIMESTAMP", new_student.called_at if new_student.called_at else None),
            bigquery.ScalarQueryParameter("answered_at", "TIMESTAMP", new_student.answered_at if new_student.answered_at else None),
            bigquery.ScalarQueryParameter("signed_up_at", "TIMESTAMP", new_student.signed_up_at if new_student.signed_up_at else None),
            bigquery.ScalarQueryParameter("teacher_accepted_at", "TIMESTAMP", new_student.teacher_accepted_at if new_student.teacher_accepted_at else None),
            bigquery.ScalarQueryParameter("comments", "STRING", new_student.comments if new_student.comments else None),
        ]
    )
    
    job = client.query(query, job_config=job_config, location='EU')
    
    try:
        job.result()  # Ensure the query is executed
    except Exception as e:
        print(f"BigQuery Insert Error: {str(e)}")
        return None  # Indicate failure

    return job


from google.cloud import bigquery
from datetime import datetime, timezone

def insert_classes(client: bigquery.Client, classes: list[Classes]):
    # Validate teacher exists (based on the first class in the list)
    teacher_user_id = classes[0].teacher_user_id
    teacher_query = f"""
        SELECT user_id FROM `{PROJECT_ID}.{USER_DATASET}.teachers`
        WHERE user_id = @teacher_user_id
    """
    teacher_job = client.query(
        teacher_query,
        job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id)
            ]
        ),
    )
    teacher_result = list(teacher_job.result())

    if not teacher_result:
        raise ValueError("Teacher does not exist")

    # Prepare rows to insert
    rows_to_insert = [
        {
            "class_id": cls.class_id[0] if isinstance(cls.class_id, tuple) else cls.class_id,
            "teacher_user_id": cls.teacher_user_id,
            "student_user_id": cls.student_user_id,
            "created_at": datetime.fromisoformat(cls.created_at.replace("Z", "")).replace(tzinfo=timezone.utc).isoformat(),
            "started_at": datetime.fromisoformat(cls.started_at.replace("Z", "")).replace(tzinfo=timezone.utc).isoformat(),
            "ended_at": datetime.fromisoformat(cls.ended_at.replace("Z", "")).replace(tzinfo=timezone.utc).isoformat(),
            "comment": cls.comment,
            "paid_teacher": cls.paid_teacher,
            "invoiced_student": cls.invoiced_student,
            "was_canselled": cls.was_canselled,
            "groupclass": cls.groupclass,
            "number_of_students": cls.number_of_students,
        }
        for cls in classes
    ]

    print(rows_to_insert[0])

    # Insert rows into BigQuery
    errors = client.insert_rows_json(
        f"{PROJECT_ID}.{CLASSES_DATASET}.classes",
        json_rows=rows_to_insert,
    )

    if errors:
        print("BigQuery insertion errors:", errors)
        raise Exception("Error inserting new class into BigQuery")

    print("Inserted all classes successfully.")
    return True

def upsert_about_me_text(client: bigquery.Client, text: str, user_id: str, firstname: str, lastname: str):
    query = f"""
        MERGE `{USER_DATASET}.about_me_texts` AS target
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
            bigquery.ScalarQueryParameter("created_at", "TIMESTAMP", datetime.now(timezone.utc))
        ]
    )

    query_job = client.query(query, job_config=job_config, location="EU")
    query_job.result()  # This will wait until the query completes (or raises errors)
    return query_job


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

def insert_quiz_questions(questions :list):

    table_id = f"{QUIZ_DATASET}.questions"

    try:
        errors = client.insert_rows_json(table_id, questions)
        if errors:
            raise Exception(f"Batch insert failed {errors}")
    
        return True
    
    except Exception as e:
        raise Exception(f"Error insering images {e}")




def insert_new_student_order(student_user_id: str, teacher_user_id: str, accept: bool, physical_or_digital: bool, location :str, comments :str, bq_client: bigquery.Client):
    table_id = "enkel-laering.users.teacher_student"

    row_id = str(uuid4())  # Ensure UUID is a string
    row = {
        "row_id": row_id,
        "student_user_id": student_user_id,
        "teacher_user_id": teacher_user_id,
        "teacher_accepted_student": accept,
        "physical_or_digital": physical_or_digital,
        "preferred_location": location,
        "order_comments": comments,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "hidden": False
    }

    # Insert the row into BigQuery
    errors = bq_client.insert_rows_json(table_id, [row])  # No 'selected_fields'

    if errors:
        raise Exception(f"Batch insert failed: {errors}")

    return True




def addTeacherToNewStudent(client: bigquery.Client, student_user_id: str, teacher_user_id: str, admin_user_id: str):
    query = f"""
        INSERT INTO `{USER_DATASET}.teacher_student`
            (row_id, teacher_user_id, student_user_id, teacher_accepted_student, physical_or_digital, preferred_location, created_at, hidden, order_comments)
        SELECT 
            GENERATE_UUID(), @teacher_user_id, @student_user_id, TRUE, NULL, NULL, CURRENT_TIMESTAMP(), FALSE, ""
        FROM UNNEST([1])
        WHERE EXISTS (
            SELECT 1
            FROM `{USER_DATASET}.teachers`
            WHERE user_id = @admin_user_id
        )
    """
    
    params = [
        bigquery.ScalarQueryParameter("teacher_user_id", "STRING", teacher_user_id),
        bigquery.ScalarQueryParameter("student_user_id", "STRING", student_user_id),
        bigquery.ScalarQueryParameter("admin_user_id", "STRING", admin_user_id)
    ]
    
    job_config = bigquery.QueryJobConfig(query_parameters=params)
    
    try:
        return client.query(query, job_config=job_config)
    except Exception as e:
        print(f"Error in addTeacherToNewStudent: {e}")
        raise e



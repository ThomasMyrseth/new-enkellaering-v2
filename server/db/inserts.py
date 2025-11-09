from typing import Optional
import uuid
from datetime import datetime, timezone

from db.gets import is_admin
from .sql_types import Classes, Teacher, Students, NewStudents, NewStudentWithPreferredTeacher
from supabase_client import supabase

def insert_teacher(teacher: Teacher):
    """Insert a new teacher"""
    data = {
        'user_id': teacher.user_id,
        'firstname': teacher.firstname,
        'lastname': teacher.lastname,
        'email': teacher.email,
        'phone': teacher.phone,
        'address': teacher.address,
        'postal_code': teacher.postal_code,
        'hourly_pay': teacher.hourly_pay,
        'resigned': teacher.resigned,
        'additional_comments': teacher.additional_comments,
        'created_at': teacher.created_at,
        'admin': teacher.admin,
        'resigned_at': teacher.resigned_at,
        'location': teacher.location,
        'digital_tutouring': teacher.digital_tutouring,
        'physical_tutouring': teacher.physical_tutouring
    }
    supabase.table('teachers').insert(data).execute()

def insert_student(student: Students):
    """Insert a new student"""
    data = {
        'user_id': student.user_id,
        'firstname_parent': student.firstname_parent,
        'lastname_parent': student.lastname_parent,
        'email_parent': student.email_parent,
        'phone_parent': student.phone_parent,
        'firstname_student': student.firstname_student,
        'lastname_student': student.lastname_student,
        'phone_student': student.phone_student,
        'created_at': student.created_at,
        'main_subjects': student.main_subjects or '',
        'additional_comments': student.additional_comments or '',
        'address': student.address,
        'has_physical_tutoring': student.has_physical_tutoring,
        'postal_code': student.postal_code,
        'is_active': student.is_active
    }
    supabase.table('students').insert(data).execute()

def insert_new_student(new_student):
    """Insert a new student lead"""
    data = {
        'phone': new_student["phone"],
        'has_called': new_student["has_called"],
        'called_at': new_student["called_at"],
        'has_answered': new_student["has_answered"],
        'answered_at': new_student["answered_at"],
        'has_signed_up': new_student["has_signed_up"],
        'signed_up_at': new_student["signed_up_at"],
        'from_referal': new_student["from_referal"],
        'referee_phone': new_student["referee_phone"],
        'referee_name': new_student["referee_name"],
        'has_assigned_teacher': new_student["has_assigned_teacher"],
        'assigned_teacher_at': new_student["assigned_teacher_at"],
        'has_finished_onboarding': new_student["has_finished_onboarding"],
        'finished_onboarding_at': new_student["finished_onboarding_at"],
        'comments': new_student["comments"],
        'new_student_id': new_student["new_student_id"],
        'preffered_teacher': new_student["preffered_teacher"],
        'created_at': new_student["created_at"],
        'referee_account_number': new_student["referee_account_number"]
    }
    supabase.table('new_students').insert(data).execute()

def insert_new_student_with_preferred_teacher(new_student: NewStudentWithPreferredTeacher):
    """Insert a new student with preferred teacher"""
    data = {
        'new_student_id': new_student.new_student_id,
        'phone': new_student.phone,
        'teacher_called': new_student.teacher_called,
        'created_at': new_student.created_at,
        'preferred_teacher': new_student.preferred_teacher,
        'teacher_answered': new_student.teacher_answered,
        'student_signed_up': new_student.student_signed_up,
        'teacher_has_accepted': new_student.teacher_has_accepted,
        'hidden': new_student.hidden,
        'physical_or_digital': new_student.physical_or_digital,
        'called_at': new_student.called_at,
        'answered_at': new_student.answered_at,
        'signed_up_at': new_student.signed_up_at,
        'teacher_accepted_at': new_student.teacher_accepted_at,
        'comments': new_student.comments
    }
    supabase.table('new_students_with_preferred_teacher').insert(data).execute()

def insert_classes(classes: list[Classes]):
    """Insert multiple classes (uses RPC function for transaction)"""
    # Convert classes to JSON format for RPC function
    classes_json = []
    for cls in classes:
        class_dict = {
            'class_id': str(cls.class_id[0] if isinstance(cls.class_id, tuple) else cls.class_id),
            'teacher_user_id': cls.teacher_user_id,
            'student_user_id': cls.student_user_id,
            'created_at': cls.created_at.isoformat() if isinstance(cls.created_at, datetime) else cls.created_at,
            'started_at': cls.started_at.isoformat() if isinstance(cls.started_at, datetime) else cls.started_at,
            'ended_at': cls.ended_at.isoformat() if isinstance(cls.ended_at, datetime) else cls.ended_at,
            'comment': cls.comment,
            'paid_teacher': cls.paid_teacher,
            'invoiced_student': cls.invoiced_student,
            'was_canselled': cls.was_canselled,
            'groupclass': cls.groupclass,
            'number_of_students': cls.number_of_students
        }
        classes_json.append(class_dict)

    # Call RPC function
    supabase.rpc('insert_classes_batch', {'classes_json': classes_json}).execute()
    return True

def upsert_about_me_text(text: str, user_id: str, firstname: str, lastname: str, image_url: Optional[str] = None):
    """Upsert about_me text with optional image_url"""
    data = {
        'user_id': user_id,
        'about_me': text,
        'firstname': firstname,
        'lastname': lastname,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'image_url': image_url
    }
    supabase.table('about_me_texts').upsert(data).execute()

def insert_quiz_result(user_id: str, quiz_id: str, passed: bool,
                       number_of_corrects: int, number_of_questions: int):
    """Insert a quiz result"""
    data = {
        'attempt_id': str(uuid.uuid4()),
        'user_id': user_id,
        'quiz_id': quiz_id,
        'passed': str(passed),
        'number_of_corrects': str(number_of_corrects),
        'number_of_questions': str(number_of_questions),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    supabase.table('quiz_results').insert(data).execute()

def insert_review(student_user_id: str, teacher_user_id: str,
                  rating: int, comment: str, name: str):
    """Insert a review"""
    data = {
        'id': str(uuid.uuid4()),
        'teacher_user_id': teacher_user_id,
        'student_user_id': student_user_id,
        'student_name': name,
        'rating': str(rating),
        'comment': comment,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    supabase.table('reviews').insert(data).execute()

def upload_image(image_title: str, quiz_id: str, image_path: str, extension: str):
    """
    Upload image to Supabase Storage and return public URL

    Args:
        image_title: Title of the image
        quiz_id: UUID of the quiz
        image_path: Local path to the image file
        extension: File extension (e.g., '.jpg', '.png')

    Returns:
        Public URL of the uploaded image
    """
    bucket_name = "quiz-images"
    destination_path = f"{quiz_id}/{image_title.replace(' ', '_')}{extension}"

    try:
        # Read the file
        with open(image_path, 'rb') as f:
            file_data = f.read()

        # Upload to Supabase Storage
        supabase.storage.from_(bucket_name).upload(
            path=destination_path,
            file=file_data,
            file_options={"content-type": f"image/{extension.lstrip('.')}", "upsert": "true"}
        )

        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(destination_path)
        return public_url

    except Exception as e:
        raise Exception(f"Error uploading image to Supabase Storage: {e}")

def insert_quiz(title: str, content: str, image_path: str,
                extension: str, pass_threshold: int,
                number_of_questions: int):
    """Insert a quiz with image upload"""
    quiz_id = str(uuid.uuid4())

    # Upload image and get public URL
    image_url = upload_image(title, quiz_id, image_path, extension)

    # Insert quiz with image_url
    data = {
        'quiz_id': quiz_id,
        'title': title,
        'content': content,
        'image_url': image_url,
        'pass_threshold': str(pass_threshold),
        'number_of_questions': str(number_of_questions),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    supabase.table('quizzes').insert(data).execute()
    return quiz_id

def insert_quiz_questions(questions: list[dict]):
    """
    Bulk insert quiz questions

    Args:
        questions: List of question dicts with keys:
            - quiz_id
            - question_id
            - question
            - options
            - correct_option
            - time_limit
            - image_url (optional)
    """
    # Prepare data for bulk insert
    questions_data = []
    for q in questions:
        question_dict = {
            'quiz_id': q["quiz_id"],
            'question_id': q["question_id"],
            'question': q["question"],
            'answer_options': q["options"],  # Note: mapping 'options' to 'answer_options'
            'correct_option': q["correct_option"],
            'time_limit': q["time_limit"],
            'image_url': q.get("image_url")  # Updated to use image_url instead of image
        }
        questions_data.append(question_dict)

    # Bulk insert
    supabase.table('questions').insert(questions_data).execute()
    return True

def insert_new_student_order(
    student_user_id: str,
    teacher_user_id: str,
    accept: bool,
    physical_or_digital: bool,
    location: str,
    comments: str
):
    """Insert a new student order (teacher-student relationship)"""
    data = {
        'row_id': str(uuid.uuid4()),
        'student_user_id': student_user_id,
        'teacher_user_id': teacher_user_id,
        'teacher_accepted_student': str(accept),
        'physical_or_digital': str(physical_or_digital),
        'preferred_location': location,
        'order_comments': comments,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'hidden': 'FALSE'
    }
    supabase.table('teacher_student').insert(data).execute()
    return True

def add_teacher_to_new_student(
    student_user_id: str,
    teacher_user_id: str,
    admin_user_id: str
):
    """Add a teacher to a new student (admin validated)"""
    # Verify admin
    admin_response = is_admin(admin_user_id)
    if not admin_response:
        raise ValueError("Admin teacher does not exist or is not admin")

    # Insert the teacher_student record
    data = {
        'row_id': str(uuid.uuid4()),
        'teacher_user_id': teacher_user_id,
        'student_user_id': student_user_id,
        'teacher_accepted_student': 'TRUE',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'hidden': 'FALSE',
        'order_comments': ''
    }
    supabase.table('teacher_student').insert(data).execute()
    return True

def insertJobApplication(
    firstname: str,
    lastname: str,
    email: str,
    phone: str,
    resumeLink: str,
    grades: str,
    subject: str,
):
    """Insert a job application"""
    data = {
        'uuid': str(uuid.uuid4()),
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'phone': phone,
        'resumelink': resumeLink,
        'grades': grades,
        'subject': subject,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    supabase.table('job_applications').insert(data).execute()

def uploadRecumeToStorage(
    resume: bytes,
    filename: str,
    firstname: str,
    lastname: str,
    content_type: str
):
    """
    Upload resume to Supabase Storage and return public URL

    Args:
        resume: Resume file as bytes
        filename: Original filename
        firstname: Applicant's first name
        lastname: Applicant's last name
        content_type: MIME type of the file

    Returns:
        Public URL of the uploaded resume
    """
    bucket_name = "enkellaering-resumes"
    destination_path = f"{firstname}_{lastname}/{filename}"

    try:
        # Upload to Supabase Storage
        supabase.storage.from_(bucket_name).upload(
            path=destination_path,
            file=resume,
            file_options={"content-type": content_type, "upsert": "true"}
        )

        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(destination_path)
        return public_url

    except Exception as e:
        raise Exception(f"Error uploading resume to Supabase Storage: {e}")

def insertNewTeacherReferal(teacherUserId: str, referalPhone: str, referalName: str, referalEmail: str):
    """Insert a new teacher referral"""
    data = {
        'uid': str(uuid.uuid4()),
        'referee_teacher_user_id': teacherUserId,
        'referral_phone': referalPhone,
        'referral_name': referalName,
        'referral_email': referalEmail,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    supabase.table('teacher_referrals').insert(data).execute()

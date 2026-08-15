import logging
import uuid
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from sqlalchemy import Time, and_, func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from db.gets import is_admin
from db.models import (
    AboutMeText,
    Classes as ClassesModel,
    HelpQueue,
    HelpSession,
    JobApplication,
    NewStudent as NewStudentModel,
    Question,
    Quiz as QuizModel,
    QuizResult,
    Review as ReviewModel,
    Student as StudentModel,
    Teacher as TeacherModel,
    TeacherHelpConfig,
    TeacherReferral,
    TeacherStudent,
)
from db.session import get_session
from .sql_types import Classes, Students, Teacher
from server_routes.tasks_client import enqueue_email_task
from supabase_client import supabase


def insert_teacher(teacher: Teacher):
    """Insert a new teacher"""
    session = get_session()
    session.add(
        TeacherModel(
            user_id=teacher.user_id,
            firstname=teacher.firstname,
            lastname=teacher.lastname,
            email=teacher.email,
            phone=teacher.phone,
            address=teacher.address,
            postal_code=teacher.postal_code,
            hourly_pay=teacher.hourly_pay,
            resigned=teacher.resigned,
            additional_comments=teacher.additional_comments,
            created_at=teacher.created_at,
            admin=teacher.admin,
            resigned_at=teacher.resigned_at,
            location=teacher.location,
            digital_tutouring=teacher.digital_tutouring,
            physical_tutouring=teacher.physical_tutouring,
        )
    )
    session.commit()


def insert_student(student: Students):
    """Insert a new student"""
    session = get_session()
    session.add(
        StudentModel(
            user_id=student.user_id,
            firstname_parent=student.firstname_parent,
            lastname_parent=student.lastname_parent,
            email_parent=student.email_parent,
            phone_parent=student.phone_parent,
            firstname_student=student.firstname_student,
            lastname_student=student.lastname_student,
            phone_student=student.phone_student,
            created_at=student.created_at,
            main_subjects=student.main_subjects or "",
            additional_comments=student.additional_comments or "",
            address=student.address,
            has_physical_tutoring=student.has_physical_tutoring,
            postal_code=student.postal_code,
            is_active=student.is_active,
        )
    )
    session.commit()


def insert_new_student(new_student):
    """Insert a new student lead"""
    session = get_session()
    session.add(
        NewStudentModel(
            phone=new_student["phone"],
            has_called=new_student["has_called"],
            called_at=new_student["called_at"],
            has_answered=new_student["has_answered"],
            answered_at=new_student["answered_at"],
            from_referal=new_student["from_referal"],
            referee_phone=new_student["referee_phone"],
            referee_name=new_student["referee_name"],
            has_finished_onboarding=new_student["has_finished_onboarding"],
            finished_onboarding_at=new_student["finished_onboarding_at"],
            comments=new_student["comments"],
            new_student_id=new_student["new_student_id"],
            preffered_teacher=new_student["preffered_teacher"],
            created_at=new_student["created_at"],
            referee_account_number=new_student["referee_account_number"],
            meta=new_student["meta"],
        )
    )
    session.commit()


def insert_classes(classes: list[Classes]):
    """Insert multiple classes, validating the teacher exists first (matches the original RPC's check)"""
    if not classes:
        return True

    session = get_session()
    teacher_id = classes[0].teacher_user_id
    exists_teacher = session.scalar(select(TeacherModel.user_id).where(TeacherModel.user_id == teacher_id))
    if not exists_teacher:
        raise ValueError("Teacher does not exist")

    for cls in classes:
        class_id = cls.class_id[0] if isinstance(cls.class_id, tuple) else cls.class_id
        session.add(
            ClassesModel(
                class_id=class_id,
                teacher_user_id=cls.teacher_user_id,
                student_user_id=cls.student_user_id,
                created_at=cls.created_at,
                started_at=cls.started_at,
                ended_at=cls.ended_at,
                comment=cls.comment,
                paid_teacher=cls.paid_teacher,
                invoiced_student=cls.invoiced_student,
                was_canselled=cls.was_canselled,
                groupclass=cls.groupclass,
                number_of_students=cls.number_of_students,
            )
        )
    session.commit()
    return True


def upsert_about_me_text(text: str, user_id: str, firstname: str, lastname: str, image_url: Optional[str] = None):
    """Upsert about_me text with optional image_url"""
    session = get_session()
    stmt = pg_insert(AboutMeText).values(
        user_id=user_id,
        about_me=text,
        firstname=firstname,
        lastname=lastname,
        created_at=datetime.now(timezone.utc),
        image_url=image_url,
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=[AboutMeText.user_id],
        set_={
            "about_me": stmt.excluded.about_me,
            "firstname": stmt.excluded.firstname,
            "lastname": stmt.excluded.lastname,
            "created_at": stmt.excluded.created_at,
            "image_url": stmt.excluded.image_url,
        },
    )
    session.execute(stmt)
    session.commit()


def insert_quiz_result(user_id: str, quiz_id: str, passed: bool, number_of_corrects: int, number_of_questions: int):
    """Insert a quiz result"""
    session = get_session()
    session.add(
        QuizResult(
            attempt_id=uuid.uuid4(),
            user_id=user_id,
            quiz_id=quiz_id,
            passed=passed,
            number_of_corrects=number_of_corrects,
            number_of_questions=number_of_questions,
            created_at=datetime.now(timezone.utc),
        )
    )
    session.commit()


def insert_review(student_user_id: str, teacher_user_id: str, rating: int, comment: str, name: str):
    """Insert a review"""
    session = get_session()
    session.add(
        ReviewModel(
            id=uuid.uuid4(),
            teacher_user_id=teacher_user_id,
            student_user_id=student_user_id,
            student_name=name,
            rating=rating,
            comment=comment,
            created_at=datetime.now(timezone.utc),
        )
    )
    session.commit()


def upload_image(image_title: str, quiz_id: str, image_path: str, extension: str):
    """Upload image to Supabase Storage and return public URL (Storage stays on the Supabase SDK)"""
    bucket_name = "quiz-images"
    destination_path = f"{quiz_id}/{image_title.replace(' ', '_')}{extension}"

    try:
        with open(image_path, "rb") as f:
            file_data = f.read()

        supabase.storage.from_(bucket_name).upload(
            path=destination_path,
            file=file_data,
            file_options={"content-type": f"image/{extension.lstrip('.')}", "upsert": "true"},
        )

        return supabase.storage.from_(bucket_name).get_public_url(destination_path)

    except Exception as e:
        raise Exception(f"Error uploading image to Supabase Storage: {e}")


def insert_quiz(title: str, content: str, image_path: str, extension: str, pass_threshold: int, number_of_questions: int):
    """Insert a quiz with image upload"""
    quiz_id = str(uuid.uuid4())
    image_url = upload_image(title, quiz_id, image_path, extension)

    session = get_session()
    session.add(
        QuizModel(
            quiz_id=quiz_id,
            title=title,
            content=content,
            image_url=image_url,
            pass_threshold=pass_threshold,
            number_of_questions=number_of_questions,
            created_at=datetime.now(timezone.utc),
        )
    )
    session.commit()
    return quiz_id


def insert_quiz_questions(questions: list[dict]):
    """Bulk insert quiz questions"""
    session = get_session()
    for q in questions:
        session.add(
            Question(
                quiz_id=q["quiz_id"],
                question_id=q["question_id"],
                question=q["question"],
                answer_options=q["options"],
                correct_option=q["correct_option"],
                time_limit=q["time_limit"],
                image_url=q.get("image_url"),
            )
        )
    session.commit()
    return True


def insert_new_student_order(
    student_user_id: str,
    teacher_user_id: str,
    accept: Optional[bool],
    physical_or_digital: Optional[bool],
    location: str,
    comments: str,
):
    """Insert a new student order (teacher-student relationship)"""
    session = get_session()
    session.add(
        TeacherStudent(
            row_id=uuid.uuid4(),
            student_user_id=student_user_id,
            teacher_user_id=teacher_user_id,
            teacher_accepted_student=accept,
            physical_or_digital=physical_or_digital,
            preferred_location=location,
            order_comments=comments,
            created_at=datetime.now(timezone.utc),
            hidden=False,
        )
    )
    session.commit()
    return True


def add_teacher_to_new_student(student_user_id: str, teacher_user_id: str, admin_user_id: str):
    """Add a teacher to a new student (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("Admin teacher does not exist or is not admin")

    session = get_session()
    session.add(
        TeacherStudent(
            row_id=uuid.uuid4(),
            teacher_user_id=teacher_user_id,
            student_user_id=student_user_id,
            teacher_accepted_student=True,
            created_at=datetime.now(timezone.utc),
            hidden=False,
            order_comments="",
        )
    )
    session.commit()
    return True


def insertJobApplication(firstname: str, lastname: str, email: str, phone: str, resumeLink: str, grades: str, subject: str):
    """Insert a job application"""
    session = get_session()
    session.add(
        JobApplication(
            uuid=uuid.uuid4(),
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            resumelink=resumeLink,
            grades=grades,
            subject=subject,
            created_at=datetime.now(timezone.utc),
        )
    )
    session.commit()


def uploadRecumeToStorage(resume: bytes, filename: str, firstname: str, lastname: str, content_type: str):
    """Upload resume to Supabase Storage and return public URL (Storage stays on the Supabase SDK)"""
    bucket_name = "enkellaering-resumes"
    destination_path = f"{firstname}_{lastname}/{filename}"

    try:
        supabase.storage.from_(bucket_name).upload(
            path=destination_path, file=resume, file_options={"content-type": content_type, "upsert": "true"}
        )
        return supabase.storage.from_(bucket_name).get_public_url(destination_path)

    except Exception as e:
        raise Exception(f"Error uploading resume to Supabase Storage: {e}")


def insertNewTeacherReferal(teacherUserId: str, referalPhone: str, referalName: str, referalEmail: str):
    """Insert a new teacher referral"""
    session = get_session()
    session.add(
        TeacherReferral(
            uid=uuid.uuid4(),
            referee_teacher_user_id=teacherUserId,
            referral_phone=referalPhone,
            referral_name=referalName,
            referral_email=referalEmail,
            created_at=datetime.now(timezone.utc),
        )
    )
    session.commit()


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) INSERT FUNCTIONS
# ============================================================================


def _find_active_session(session, teacher_user_id: Optional[str] = None):
    """
    Mirrors find_active_session_for_teacher / find_shortest_queue_session RPCs:
    an active help session right now (recurring, matching day/time in
    Europe/Oslo, or one-time and within its start/end range), for the given
    teacher if any, else whichever active session currently has the shortest
    waiting queue.
    """
    oslo_now = func.timezone("Europe/Oslo", func.current_timestamp())
    now_utc_col = func.current_timestamp()

    recurring_match = and_(
        HelpSession.recurring.is_(True),
        HelpSession.day_of_week == func.extract("isodow", oslo_now) - 1,
        func.cast(oslo_now, Time) >= func.cast(HelpSession.start_time, Time),
        func.cast(oslo_now, Time) < func.cast(HelpSession.end_time, Time),
    )
    one_time_match = and_(HelpSession.recurring.is_(False), now_utc_col >= HelpSession.start_time, now_utc_col < HelpSession.end_time)

    if teacher_user_id:
        stmt = (
            select(HelpSession.session_id, HelpSession.zoom_link, HelpSession.teacher_user_id)
            .where(HelpSession.teacher_user_id == teacher_user_id, HelpSession.is_active.is_(True), or_(recurring_match, one_time_match))
            .limit(1)
        )
        return session.execute(stmt).first()

    queue_count_subq = (
        select(HelpQueue.assigned_session_id, func.count(HelpQueue.queue_id).label("queue_count"))
        .where(HelpQueue.status == "waiting")
        .group_by(HelpQueue.assigned_session_id)
        .subquery()
    )
    stmt = (
        select(HelpSession.session_id, HelpSession.zoom_link, HelpSession.teacher_user_id)
        .join(TeacherHelpConfig, TeacherHelpConfig.teacher_user_id == HelpSession.teacher_user_id)
        .outerjoin(queue_count_subq, queue_count_subq.c.assigned_session_id == HelpSession.session_id)
        .where(HelpSession.is_active.is_(True), TeacherHelpConfig.available_for_help.is_(True), or_(recurring_match, one_time_match))
        .order_by(func.coalesce(queue_count_subq.c.queue_count, 0).asc())
        .limit(1)
    )
    return session.execute(stmt).first()


def insert_help_queue_entry(
    student_name: str,
    student_email: Optional[str],
    student_phone: Optional[str],
    subject: str,
    description: Optional[str],
    preferred_teacher_id: Optional[str] = None,
):
    """
    Insert student into help queue and assign to session.
    Uses "snarest" logic if preferred_teacher_id is None.
    """
    session = get_session()
    found = _find_active_session(session, preferred_teacher_id)

    if not found:
        raise ValueError("Ingen aktive økter tilgjengelig")

    session_id, zoom_join_link, teacher_user_id = found

    teacher_email = None
    teacher_name = "Lærer"

    if teacher_user_id:
        try:
            teacher = session.execute(
                select(TeacherModel.email, TeacherModel.firstname, TeacherModel.lastname).where(
                    TeacherModel.user_id == teacher_user_id
                )
            ).first()
            if teacher:
                teacher_email = teacher.email
                teacher_name = f"{teacher.firstname or ''} {teacher.lastname or ''}".strip() or "Lærer"
        except Exception as e:
            logging.error(f"Failed to fetch teacher info for user_id {teacher_user_id}: {e}")

    next_position = (
        session.scalar(
            select(func.count(HelpQueue.queue_id)).where(
                HelpQueue.assigned_session_id == session_id, HelpQueue.status == "waiting"
            )
        )
        or 0
    ) + 1

    queue_id = uuid.uuid4()
    session.add(
        HelpQueue(
            queue_id=queue_id,
            student_name=student_name,
            student_email=student_email,
            student_phone=student_phone,
            subject=subject,
            description=description,
            preferred_teacher_id=preferred_teacher_id,
            assigned_session_id=session_id,
            status="waiting",
            position=next_position,
            created_at=datetime.now(timezone.utc),
        )
    )
    session.commit()

    if teacher_email and zoom_join_link:
        try:
            message_data = {
                "student_name": student_name,
                "student_email": student_email,
                "teacher_email": teacher_email,
                "teacher_name": teacher_name,
                "subject": subject,
                "description": description or "",
                "position": next_position,
                "zoom_link": zoom_join_link,
            }

            enqueue_email_task("/tasks/send-help-queue-email", message_data)
            logging.info(f"Enqueued help queue email message: {message_data}")
        except Exception as e:
            print("Failed to enqueue help queue email:", e)
            logging.error(f"Failed to enqueue help queue email: {e}")

    return str(queue_id), zoom_join_link


def insert_help_session(
    teacher_user_id: str,
    start_time: str,  # HH:MM
    end_time: str,  # HH:MM
    created_by_user_id: str,
    zoom_link: str,
    recurring: bool = False,
    day_of_week: Optional[int] = None,
    session_date: Optional[str] = None,  # YYYY-MM-DD
):
    """Insert a new help session (recurring or one-time)"""
    OSLO_TZ = ZoneInfo("Europe/Oslo")

    if not zoom_link or not zoom_link.strip():
        raise ValueError("zoom_link is required for all sessions")

    if recurring and day_of_week is None:
        raise ValueError("day_of_week is required for recurring sessions")

    if not recurring and session_date is None:
        raise ValueError("session_date is required for one-time sessions")

    session_id = uuid.uuid4()

    if not recurring:
        start_local = datetime.fromisoformat(f"{session_date}T{start_time}").replace(tzinfo=OSLO_TZ)
        end_local = datetime.fromisoformat(f"{session_date}T{end_time}").replace(tzinfo=OSLO_TZ)
    else:
        today_str = datetime.now(OSLO_TZ).date().isoformat()
        start_local = datetime.fromisoformat(f"{today_str}T{start_time}").replace(tzinfo=OSLO_TZ)
        end_local = datetime.fromisoformat(f"{today_str}T{end_time}").replace(tzinfo=OSLO_TZ)

    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    db_session = get_session()
    db_session.add(
        HelpSession(
            session_id=session_id,
            teacher_user_id=teacher_user_id,
            recurring=recurring,
            day_of_week=day_of_week,
            start_time=start_utc,
            end_time=end_utc,
            is_active=True,
            created_by_user_id=created_by_user_id,
            created_at=datetime.now(timezone.utc),
            zoom_link=zoom_link,
        )
    )
    db_session.commit()
    return str(session_id)

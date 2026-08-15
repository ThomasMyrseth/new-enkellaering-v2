from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, or_, select, update

from db.gets import is_admin
from db.models import Classes, HelpSession, NewStudent, QuizResult, Question, Quiz, Review, TeacherStudent
from db.session import get_session
from supabase_client import supabase


def hide_new_student(row_id: str, admin_user_id: str):
    """Hide a new student order (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(update(TeacherStudent).where(TeacherStudent.row_id == row_id).values(hidden=True))
    session.commit()


def hide_new_order_from_new_students_table(new_student_id: str, admin_user_id: str):
    """Hide a new order from new_students table (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(update(NewStudent).where(NewStudent.new_student_id == new_student_id).values(hidden=True))
    session.commit()


def delete_class(teacher_user_id: str, class_id: str):
    """Delete a class by class_id (admin), or by class_id + teacher_user_id (non-admin, own classes only)"""
    session = get_session()
    admin_response = is_admin(teacher_user_id)

    if not admin_response:
        session.execute(delete(Classes).where(Classes.class_id == class_id, Classes.teacher_user_id == teacher_user_id))
    else:
        session.execute(delete(Classes).where(Classes.class_id == class_id))
    session.commit()


def delete_review(student_user_id: str, teacher_user_id: str):
    """Delete a review by student_user_id and teacher_user_id"""
    session = get_session()
    session.execute(delete(Review).where(Review.student_user_id == student_user_id, Review.teacher_user_id == teacher_user_id))
    session.commit()


def remove_teacher_from_student(teacher_user_id: str, student_user_id: str, admin_user_id: str):
    """Remove teacher from student by setting hidden to TRUE (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(
        update(TeacherStudent)
        .where(TeacherStudent.teacher_user_id == teacher_user_id, TeacherStudent.student_user_id == student_user_id)
        .values(hidden=True)
    )
    session.commit()


def delete_folder_from_bucket(quiz_id: str, bucket_name: str = "quiz-images"):
    """Delete all files in a quiz folder from Supabase Storage (Storage stays on the Supabase SDK)"""
    try:
        files_response = supabase.storage.from_(bucket_name).list(path=f"{quiz_id}/")

        if files_response:
            file_paths = [f"{quiz_id}/{file['name']}" for file in files_response]
            if file_paths:
                supabase.storage.from_(bucket_name).remove(file_paths)

        return True
    except Exception as e:
        raise Exception(f"Error deleting folder from Supabase Storage: {e}")


def delete_quizzes(admin_user_id: str, quiz_ids: list[str]):
    """Delete quizzes with cascade (admin validated)"""
    session = get_session()
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session.execute(delete(QuizResult).where(QuizResult.quiz_id.in_(quiz_ids)))
    session.execute(delete(Question).where(Question.quiz_id.in_(quiz_ids)))
    session.execute(delete(Quiz).where(Quiz.quiz_id.in_(quiz_ids)))
    session.commit()

    for quiz_id in quiz_ids:
        try:
            delete_folder_from_bucket(quiz_id)
        except Exception as e:
            print(f"Warning: Could not delete storage for quiz {quiz_id}: {e}")

    return True


def hide_old_orders(days_old: int):
    """Hide old orders that are older than specified days and not accepted"""
    session = get_session()
    threshold_date = datetime.now(timezone.utc) - timedelta(days=days_old)

    session.execute(
        update(TeacherStudent)
        .where(
            TeacherStudent.created_at < threshold_date,
            or_(TeacherStudent.teacher_accepted_student.is_(None), TeacherStudent.teacher_accepted_student.is_(False)),
        )
        .values(hidden=True)
    )
    session.commit()


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) DELETE FUNCTIONS
# ============================================================================


def delete_help_session(session_id: str, user_id: str):
    """Soft delete help session (set is_active = false)"""
    session = get_session()
    owner_teacher_id = session.scalar(select(HelpSession.teacher_user_id).where(HelpSession.session_id == session_id))
    if owner_teacher_id is None:
        raise ValueError("Økten ble ikke funnet")

    if owner_teacher_id != user_id and not is_admin(user_id):
        raise ValueError("Du har ikke tillatelse til å slette denne økten")

    session.execute(update(HelpSession).where(HelpSession.session_id == session_id).values(is_active=False))
    session.commit()

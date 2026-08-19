from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional

from sqlalchemy import select, update

from db.gets import is_admin
from db.models import (
    AvailableSubject,
    HelpQueue,
    NewStudent,
    Student,
    Teacher,
    TeacherHelpConfig,
    TeacherStudent,
)
from db.session import get_session

# Fields the original RPC's dynamic UPDATE...SET COALESCE(...) block allowed;
# validated against the NewStudent model's real columns below rather than
# trusted as freestanding strings, so a schema change/typo here fails loudly
# instead of silently updating nothing.
_ALTER_NEW_STUDENT_FIELDS = {
    "has_called",
    "called_at",
    "has_answered",
    "answered_at",
    "from_referal",
    "referee_phone",
    "has_finished_onboarding",
    "finished_onboarding_at",
    "comments",
    "paid_referee",
    "paid_referee_at",
    "meta",
}
assert _ALTER_NEW_STUDENT_FIELDS.issubset({c.name for c in NewStudent.__table__.columns})


def alter_new_student(new_student_id: str, admin_user_id: str, updates: dict):
    """Update new_student with dynamic fields (admin-existence validated, matching the original RPC)"""
    session = get_session()
    exists_admin = session.scalar(select(Teacher.user_id).where(Teacher.user_id == admin_user_id))
    if not exists_admin:
        raise ValueError("Admin teacher does not exist")

    values = {k: v for k, v in updates.items() if k in _ALTER_NEW_STUDENT_FIELDS and v is not None}
    if values:
        session.execute(update(NewStudent).where(NewStudent.new_student_id == new_student_id).values(**values))
        session.commit()
    return True

def change_teacher_by_user_id(student_user_id: str, new_teacher_user_id: str, admin_user_id: str, old_teacher_user_id: str):
    """Change teacher for a student (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(
        update(TeacherStudent)
        .where(TeacherStudent.student_user_id == student_user_id, TeacherStudent.teacher_user_id == old_teacher_user_id)
        .values(teacher_user_id=new_teacher_user_id)
    )
    session.commit()


def remove_teacher_from_student(student_user_id: str, teacher_user_id: str, admin_user_id: str):
    """Remove teacher from student by setting hidden to TRUE (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(
        update(TeacherStudent)
        .where(TeacherStudent.student_user_id == student_user_id, TeacherStudent.teacher_user_id == teacher_user_id)
        .values(hidden=True)
    )
    session.commit()


def set_classes_to_invoiced(class_ids: list, admin_user_id: str):
    """Set classes to invoiced status (admin validated)"""
    from db.models import Classes

    session = get_session()
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session.execute(
        update(Classes)
        .where(Classes.class_id.in_(class_ids))
        .values(invoiced_student=True, invoiced_student_at=datetime.now(timezone.utc))
    )
    session.commit()
    return True


def set_classes_to_paid(class_ids: list, admin_user_id: str):
    """Set classes to paid status (admin validated)"""
    from db.models import Classes

    session = get_session()
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session.execute(
        update(Classes).where(Classes.class_id.in_(class_ids)).values(paid_teacher=True, paid_teacher_at=datetime.now(timezone.utc))
    )
    session.commit()
    return True


def _set_student_status(student_user_id: str, admin_user_id: str, status: str):
    """Set a student's status (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(
        update(Student)
        .where(Student.user_id == student_user_id)
        .values(status=status, status_changed_at=datetime.now(timezone.utc))
    )
    session.commit()


def set_student_to_inactive(student_user_id: str, admin_user_id: str):
    """Set student to inactive (admin validated)"""
    _set_student_status(student_user_id, admin_user_id, "inactive")


def set_student_to_active(student_user_id: str, admin_user_id: str):
    """Set student to active (admin validated)"""
    _set_student_status(student_user_id, admin_user_id, "active")


def freeze_student(student_user_id: str, admin_user_id: str):
    """Temporarily freeze a student (admin validated) - not inactive, just paused"""
    _set_student_status(student_user_id, admin_user_id, "frozen")


def unfreeze_student(student_user_id: str, admin_user_id: str):
    """Unfreeze a student (admin validated)"""
    _set_student_status(student_user_id, admin_user_id, "active")


def toggle_want_more_students(physical: bool, digital: bool, teacher_user_id: str):
    """Toggle teacher's preferences for accepting new students"""
    session = get_session()
    session.execute(
        update(Teacher).where(Teacher.user_id == teacher_user_id).values(digital_tutouring=digital, physical_tutouring=physical)
    )
    session.commit()


def update_student_notes(admin_user_id: str, student_user_id: str, notes: str):
    """Update student notes (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(update(Student).where(Student.user_id == student_user_id).values(notes=notes))
    session.commit()


def update_student_discount(admin_user_id: str, student_user_id: str, discount: float):
    """Update student discount (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(update(Student).where(Student.user_id == student_user_id).values(discount=discount))
    session.commit()


def update_teacher_notes(admin_user_id: str, teacher_user_id: str, notes: str):
    """Update teacher notes (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(update(Teacher).where(Teacher.user_id == teacher_user_id).values(notes=notes))
    session.commit()


def cancel_new_order(row_id: str):
    """Cancel a new order by setting hidden to TRUE"""
    session = get_session()
    session.execute(update(TeacherStudent).where(TeacherStudent.row_id == row_id).values(hidden=True))
    session.commit()


def update_new_order(
    row_id: str,
    teacher_accepted_student: Optional[bool] = None,
    physical_or_digital: Optional[bool] = None,
    preferred_location: Optional[str] = None,
    comments: Optional[str] = None,
):
    """Update new order with dynamic fields"""
    values: Dict[str, Any] = {}
    if teacher_accepted_student is not None:
        values["teacher_accepted_student"] = teacher_accepted_student
    if physical_or_digital is not None:
        values["physical_or_digital"] = physical_or_digital
    if preferred_location is not None:
        values["preferred_location"] = preferred_location
    if comments is not None:
        values["order_comments"] = comments

    if not values:
        raise ValueError("No fields provided for update")

    session = get_session()
    session.execute(update(TeacherStudent).where(TeacherStudent.row_id == row_id).values(**values))
    session.commit()
    return True


def update_teacher_profile(
    teacher_user_id: str,
    firstname: str,
    lastname: str,
    phone: str,
    address: str,
    postal_code: str,
    additional_comments: Optional[str] = None,
    location: Optional[str] = None,
    physical: Optional[bool] = None,
    digital: Optional[bool] = None,
):
    """Update teacher profile"""
    session = get_session()
    session.execute(
        update(Teacher)
        .where(Teacher.user_id == teacher_user_id)
        .values(
            firstname=firstname,
            lastname=lastname,
            phone=phone,
            address=address,
            postal_code=postal_code,
            additional_comments=additional_comments,
            location=location,
            physical_tutouring=physical,
            digital_tutouring=digital,
        )
    )
    session.commit()


def update_travel_payment(travel_payment: dict, admin_user_id: str):
    """Update travel payment for teacher-student relationship (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(
        update(TeacherStudent)
        .where(
            TeacherStudent.student_user_id == travel_payment["student_user_id"],
            TeacherStudent.teacher_user_id == travel_payment["teacher_user_id"],
        )
        .values(
            travel_pay_to_teacher=Decimal(str(travel_payment["travel_pay_to_teacher"])),
            travel_pay_from_student=Decimal(str(travel_payment["travel_pay_from_student"])),
        )
    )
    session.commit()


def _set_teacher_status(teacher_user_id: str, admin_user_id: str, status: str):
    """Set a teacher's status (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    session.execute(
        update(Teacher)
        .where(Teacher.user_id == teacher_user_id)
        .values(status=status, status_changed_at=datetime.now(timezone.utc))
    )
    session.commit()


def retireTeacher(teacherUserId: str, adminUserId: str):
    """Retire a teacher (admin validated)"""
    _set_teacher_status(teacherUserId, adminUserId, "resigned")


def reactivateTeacher(teacherUserId: str, adminUserId: str):
    """Reactivate a teacher (admin validated)"""
    _set_teacher_status(teacherUserId, adminUserId, "active")


def freeze_teacher(teacher_user_id: str, admin_user_id: str):
    """Temporarily freeze a teacher (admin validated) - not resigned, just paused"""
    _set_teacher_status(teacher_user_id, admin_user_id, "frozen")


def unfreeze_teacher(teacher_user_id: str, admin_user_id: str):
    """Unfreeze a teacher (admin validated)"""
    _set_teacher_status(teacher_user_id, admin_user_id, "active")


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) UPDATE FUNCTIONS
# ============================================================================


def update_teacher_help_config(teacher_user_id: str, available_for_help: Optional[bool] = None):
    """Upsert teacher help config"""
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    session = get_session()
    values: Dict[str, Any] = {
        "teacher_user_id": teacher_user_id,
        "updated_at": datetime.now(timezone.utc),
    }
    if available_for_help is not None:
        values["available_for_help"] = available_for_help

    stmt = pg_insert(TeacherHelpConfig).values(**values)
    stmt = stmt.on_conflict_do_update(index_elements=[TeacherHelpConfig.teacher_user_id], set_=values)
    session.execute(stmt)
    session.commit()


def update_queue_status(queue_id: str, status: str):
    """Update queue entry status (admit, complete, no-show)"""
    valid_statuses = ["admitted", "completed", "no_show"]
    if status not in valid_statuses:
        raise ValueError(f"Invalid status: {status}")

    session = get_session()
    values: Dict[str, Any] = {"status": status}
    if status == "admitted":
        values["admitted_at"] = datetime.now(timezone.utc)
    elif status == "completed":
        values["completed_at"] = datetime.now(timezone.utc)

    session.execute(update(HelpQueue).where(HelpQueue.queue_id == queue_id).values(**values))
    session.commit()

    session_id = session.scalar(select(HelpQueue.assigned_session_id).where(HelpQueue.queue_id == queue_id))
    if session_id:
        _reorder_queue_positions(session, session_id)


def _reorder_queue_positions(session, session_id):
    """Reassign 1-based positions to waiting entries for a session, ordered by created_at (mirrors reorder_queue_positions RPC)"""
    waiting = session.scalars(
        select(HelpQueue)
        .where(HelpQueue.assigned_session_id == session_id, HelpQueue.status == "waiting")
        .order_by(HelpQueue.created_at.asc())
    ).all()
    for position, entry in enumerate(waiting, start=1):
        entry.position = position
    session.commit()


def update_available_subject(teacher_user_id: str, available: bool, subject: Optional[str] = None):
    """Update available subjects for a teacher (replaces existing)"""
    if not subject:
        raise ValueError("subjects_ids list cannot be empty")

    session = get_session()
    session.execute(
        AvailableSubject.__table__.delete().where(
            AvailableSubject.teacher_user_id == teacher_user_id, AvailableSubject.subject == subject
        )
    )
    if available:
        session.add(AvailableSubject(teacher_user_id=teacher_user_id, subject=subject))
    session.commit()
    return True

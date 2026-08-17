from datetime import datetime, timedelta, timezone

from sqlalchemy import func, or_, select, update

from db.models import Classes, Student, Task, Teacher, TeacherStudent
from db.session import get_session


def get_students_with_no_classes(number_of_days: int = 21) -> list[dict]:
    """Students who have not attended any classes in the past `number_of_days` days"""
    import db.gets as gets

    return gets.get_students_with_few_classes(number_of_days)


def get_students_who_have_had_task(number_of_days: int = 21, task_type: str = "followup_student") -> list[str]:
    """Student IDs who have had tasks assigned in the past `number_of_days` days"""
    session = get_session()
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=number_of_days)
    rows = session.scalars(
        select(Task.student).where(Task.created_at >= cutoff_date, Task.type == task_type, Task.student.isnot(None))
    ).all()
    return list(set(rows))


def get_students_with_open_tasks() -> list[str]:
    """Student IDs who have open (non-completed) tasks assigned"""
    session = get_session()
    rows = session.scalars(select(Task.student).where(Task.status != "completed", Task.student.isnot(None))).all()
    return list(set(rows))


def create_new_tasks(cutoff_days: int = 21) -> list[str]:
    """
    Create new tasks for students who have not attended classes in the cutoff
    window and have not had (or don't already have open) followup tasks.
    Creates one task per student with all their teachers.
    """
    session = get_session()
    students_with_no_classes: list[dict] = get_students_with_no_classes(cutoff_days)
    students_ids_with_tasks: list[str] = get_students_who_have_had_task(cutoff_days)
    students_with_open_tasks: list[str] = get_students_with_open_tasks()

    cutoff_weeks = cutoff_days // 7

    students_to_create_tasks_for = [
        student
        for student in students_with_no_classes
        if student["student"]["user_id"] not in students_ids_with_tasks
        and student["student"]["user_id"] not in students_with_open_tasks
    ]

    student_teachers_map = {}
    for student in students_to_create_tasks_for:
        student_id = student["student"]["user_id"]
        if student_id not in student_teachers_map:
            student_teachers_map[student_id] = {"student": student["student"], "teacher_ids": set()}
        student_teachers_map[student_id]["teacher_ids"].add(student["teacher"]["user_id"])

    created_names = []
    for student_id, data in student_teachers_map.items():
        student_data = data["student"]
        teacher_ids = list(data["teacher_ids"])

        session.add(
            Task(
                created_at=datetime.now(timezone.utc),
                title=f"{student_data['firstname_student']} {student_data['lastname_student']} har ikke hatt timer på {cutoff_weeks} uker",
                description=(
                    f"Studenten {student_data['firstname_student']} {student_data['lastname_student']} har ikke hatt "
                    f"noen timer på {cutoff_weeks} uker. Vennligst ta kontakt for å følge opp. Du vil ikke få flere "
                    f"påminnnelser om {student_data['firstname_student']} på tre uker. Dersom du setter "
                    f"{student_data['firstname_student']} til inaktiv vil du få ingen varslinger om hen."
                ),
                status="pending",
                type="followup_student",
                teacher_ids=teacher_ids,
                student=student_id,
            )
        )
        created_names.append(f"{student_data['firstname_student']} {student_data['lastname_student']}")

    session.commit()
    return created_names


def get_teachers_with_few_hours(cutoff_days: int = 14, min_hours: float = 4.0) -> list[dict]:
    """Active teachers who have taught less than min_hours in the past cutoff_days days (includes 0-class teachers)"""
    session = get_session()
    threshold_date = datetime.now(timezone.utc) - timedelta(days=cutoff_days)

    hours_expr = func.sum(func.extract("epoch", Classes.ended_at - Classes.started_at) / 3600.0)
    teacher_hours = (
        select(Classes.teacher_user_id, hours_expr.label("hours"))
        .where(Classes.started_at >= threshold_date, Classes.started_at.isnot(None), Classes.ended_at.isnot(None))
        .group_by(Classes.teacher_user_id)
        .subquery()
    )

    stmt = (
        select(Teacher, func.coalesce(teacher_hours.c.hours, 0).label("total_hours"))
        .outerjoin(teacher_hours, teacher_hours.c.teacher_user_id == Teacher.user_id)
        .where(Teacher.status == "active", func.coalesce(teacher_hours.c.hours, 0) < min_hours)
    )
    rows = session.execute(stmt).all()
    return [{"teacher": t.as_dict(), "total_hours": float(hours)} for t, hours in rows]


def get_teachers_who_have_had_task(number_of_days: int = 14) -> list[str]:
    """Teacher IDs who have had a followup_teacher task created in the past N days"""
    session = get_session()
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=number_of_days)
    rows = session.scalars(
        select(Task.teacher).where(Task.created_at >= cutoff_date, Task.type == "followup_teacher", Task.teacher.isnot(None))
    ).all()
    return list(set(rows))


def get_teachers_with_open_tasks() -> list[str]:
    """Teacher IDs who have open followup_teacher tasks"""
    session = get_session()
    rows = session.scalars(
        select(Task.teacher).where(Task.status != "completed", Task.type == "followup_teacher", Task.teacher.isnot(None))
    ).all()
    return list(set(rows))


def get_all_open_teacher_tasks() -> list[dict]:
    """All open teacher follow-up tasks with embedded teacher data (mirrors get_all_open_teacher_tasks RPC)"""
    session = get_session()
    stmt = (
        select(Task, Teacher)
        .outerjoin(Teacher, Teacher.user_id == Task.teacher)
        .where(
            Task.completed.is_(False),
            Task.type == "followup_teacher",
            Teacher.status == "active",
        )
    )
    rows = session.execute(stmt).all()
    result = []
    for task, teacher in rows:
        d = {
            "id": task.id,
            "created_at": task.created_at,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "type": task.type,
            "completed": task.completed,
            "completed_at": task.completed_at,
            "notes": task.notes,
            "teacher_data": teacher.as_dict() if teacher else None,
        }
        result.append(d)
    return result


def create_new_tasks_for_teachers(cutoff_days: int = 14, min_hours: float = 4.0) -> list[str]:
    """Create new tasks for teachers who have had few hours and no recent/open followup task. One task per teacher."""
    session = get_session()
    teachers_with_few_classes: list[dict] = get_teachers_with_few_hours(cutoff_days, min_hours)
    teacher_ids_with_tasks: list[str] = get_teachers_who_have_had_task(cutoff_days)
    teacher_ids_with_open_tasks: list[str] = get_teachers_with_open_tasks()

    cutoff_weeks = cutoff_days // 7

    teachers_to_create_tasks_for = [
        entry
        for entry in teachers_with_few_classes
        if entry["teacher"]["user_id"] not in teacher_ids_with_tasks and entry["teacher"]["user_id"] not in teacher_ids_with_open_tasks
    ]

    created_names = []
    for entry in teachers_to_create_tasks_for:
        teacher = entry["teacher"]
        total_hours = round(entry.get("total_hours", 0), 1)
        teacher_id = teacher["user_id"]

        session.add(
            Task(
                created_at=datetime.now(timezone.utc),
                title=f"{teacher['firstname']} {teacher['lastname']} har hatt få timer de siste {cutoff_weeks} ukene",
                description=(
                    f"Læreren {teacher['firstname']} {teacher['lastname']} har bare hatt {total_hours} timer de siste "
                    f"{cutoff_weeks} ukene. Vennligst ta kontakt for å følge opp."
                ),
                status="pending",
                type="followup_teacher",
                teacher_ids=[teacher_id],
                teacher=teacher_id,
                student=None,
            )
        )
        created_names.append(f"{teacher['firstname']} {teacher['lastname']}")

    session.commit()
    return created_names


def update_status_on_task(task_id: int, new_status: str) -> None:
    """Update the status of a task"""
    session = get_session()
    session.execute(update(Task).where(Task.id == task_id).values(status=new_status))
    session.commit()


def update_notes_on_task(task_id: int, notes: str) -> None:
    """Update the admin notes on a task"""
    session = get_session()
    session.execute(update(Task).where(Task.id == task_id).values(notes=notes))
    session.commit()


def get_all_open_tasks() -> list[dict]:
    """
    All open tasks with embedded student and teacher data (mirrors the live
    get_all_open_tasks() RPC — introspected via pg_get_functiondef since it
    isn't documented in supabase_rpc_functions.sql at all).
    """
    session = get_session()
    stmt = select(Task, Student).outerjoin(Student, Student.user_id == Task.student).where(
        Task.completed.is_(False), Student.status == "active"
    )
    rows = session.execute(stmt).all()

    result = []
    for task, student in rows:
        teacher_ids = set(task.teacher_ids or [])
        linked_teacher_ids = set(
            session.scalars(
                select(TeacherStudent.teacher_user_id).where(
                    TeacherStudent.student_user_id == task.student, TeacherStudent.hidden.is_(False)
                )
            ).all()
        )
        all_teacher_ids = teacher_ids | linked_teacher_ids
        teachers = []
        if all_teacher_ids:
            teachers = [
                t.as_dict()
                for t in session.scalars(
                    select(Teacher).where(Teacher.user_id.in_(all_teacher_ids), Teacher.status == "active")
                ).all()
            ]

        result.append(
            {
                "id": task.id,
                "created_at": task.created_at,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "type": task.type,
                "completed": task.completed,
                "completed_at": task.completed_at,
                "notes": task.notes,
                "student_data": student.as_dict() if student else None,
                "teachers_data": teachers,
            }
        )
    return result


def close_task(task_id: int) -> None:
    """Mark a task as completed"""
    session = get_session()
    session.execute(
        update(Task).where(Task.id == task_id).values(completed=True, status="completed", completed_at=datetime.now(timezone.utc))
    )
    session.commit()

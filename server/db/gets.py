import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import Date, Time, and_, exists, func, or_, select

from db.models import (
    AboutMeText,
    AvailableSubject,
    Classes,
    HelpQueue,
    HelpSession,
    NewStudent,
    Question,
    Quiz,
    QuizResult,
    Review,
    Student,
    Teacher,
    TeacherHelpConfig,
    TeacherReferral,
    TeacherStudent,
)
from db.session import get_session


def is_admin(user_id: str) -> bool:
    """Check if a user is an admin"""
    session = get_session()
    admin = session.scalar(select(Teacher.admin).where(Teacher.user_id == user_id))
    return bool(admin)


def get_all_teachers():
    """Get all active teachers (status == 'active')"""
    session = get_session()
    rows = session.scalars(select(Teacher).where(Teacher.status == "active")).all()
    return [t.as_dict() for t in rows]


def get_all_teachers_inc_resigned():
    """Get all teachers including resigned ones"""
    session = get_session()
    rows = session.scalars(select(Teacher)).all()
    return [t.as_dict() for t in rows]


def get_all_students(admin_user_id: str, has_teacher: Optional[bool] = None):
    """Get all students (admin validated). If has_teacher is True, only include
    students with an accepted, non-hidden relation to an active teacher.
    If False, only include students without such a relation. If None, no filter."""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()

    if has_teacher is None:
        rows = session.scalars(select(Student)).all()
    else:
        has_teacher_subq = (
            select(TeacherStudent.student_user_id)
            .join(Teacher, Teacher.user_id == TeacherStudent.teacher_user_id)
            .where(
                TeacherStudent.teacher_accepted_student.is_(True),
                or_(TeacherStudent.hidden.is_(False), TeacherStudent.hidden.is_(None)),
                Teacher.status == "active",
            )
        )
        condition = Student.user_id.in_(has_teacher_subq) if has_teacher else Student.user_id.not_in(has_teacher_subq)
        rows = session.scalars(select(Student).where(condition)).all()

    return [s.as_dict() for s in rows]


def get_teacher_by_user_id(user_id: str):
    """Get teacher by user_id"""
    session = get_session()
    rows = session.scalars(select(Teacher).where(Teacher.user_id == user_id)).all()
    return [t.as_dict() for t in rows]


def get_student_by_user_id(user_id: str):
    """Get student by user_id"""
    session = get_session()
    rows = session.scalars(select(Student).where(Student.user_id == user_id)).all()
    return [s.as_dict() for s in rows]


def get_students_by_user_ids(user_ids: list):
    """Get multiple students by list of user_ids"""
    if not user_ids:
        return []

    logging.info(f"get_students_by_user_ids received: {user_ids}, type: {type(user_ids)}")

    if isinstance(user_ids, str):
        try:
            user_ids = json.loads(user_ids)
            logging.info(f"Parsed string to list: {user_ids}")
        except Exception:
            logging.error(f"Failed to parse user_ids string: {user_ids}")
            return []

    if not isinstance(user_ids, list):
        user_ids = list(user_ids)

    user_ids = [str(uid) for uid in user_ids]

    session = get_session()
    rows = session.scalars(select(Student).where(Student.user_id.in_(user_ids))).all()
    return [s.as_dict() for s in rows]


def get_all_referrals(admin_user_id: str):
    """Get all referrals (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    rows = session.scalars(select(TeacherReferral)).all()
    return [r.as_dict() for r in rows]


def get_referral_by_user_id(admin_user_id: str, target_referee_user_id: str):
    """Get referral by user_id (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    rows = session.scalars(
        select(TeacherReferral).where(TeacherReferral.referee_teacher_user_id == target_referee_user_id)
    ).all()
    return [r.as_dict() for r in rows]


def get_all_new_students(admin_user_id: str):
    """Get all new students (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    rows = session.scalars(select(NewStudent)).all()
    return [n.as_dict() for n in rows]


def get_all_students_without_teacher(admin_user_id: str):
    """Get all students without teacher (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    has_accepted_teacher = select(TeacherStudent.student_user_id).where(
        TeacherStudent.teacher_accepted_student.is_(True),
        or_(TeacherStudent.hidden.is_(False), TeacherStudent.hidden.is_(None)),
    )
    rows = session.scalars(select(Student).where(Student.user_id.not_in(has_accepted_teacher))).all()
    return [s.as_dict() for s in rows]


def get_new_orders_for_teacher(teacher_user_id: str):
    """Get new orders (pending acceptances) for a teacher, joined with student"""
    session = get_session()
    stmt = (
        select(TeacherStudent, Student)
        .join(Student, Student.user_id == TeacherStudent.student_user_id)
        .where(
            TeacherStudent.teacher_user_id == teacher_user_id,
            TeacherStudent.teacher_accepted_student.is_(None),
            or_(TeacherStudent.hidden.is_(None), TeacherStudent.hidden.is_(False)),
        )
    )
    rows = session.execute(stmt).all()
    return [{"teacher_student": ts.as_dict(), "student": s.as_dict()} for ts, s in rows]


def get_new_orders_for_student(student_user_id: str):
    """Get new orders (pending acceptances) for a student, joined with teacher + about_me"""
    session = get_session()
    stmt = (
        select(TeacherStudent, Teacher, AboutMeText)
        .join(Teacher, Teacher.user_id == TeacherStudent.teacher_user_id)
        .outerjoin(AboutMeText, AboutMeText.user_id == Teacher.user_id)
        .where(
            TeacherStudent.student_user_id == student_user_id,
            or_(TeacherStudent.teacher_accepted_student.is_(None), TeacherStudent.teacher_accepted_student.is_(False)),
            or_(TeacherStudent.hidden.is_(None), TeacherStudent.hidden.is_(False)),
        )
    )
    rows = session.execute(stmt).all()
    return [
        {"order": ts.as_dict(), "teacher": t.as_dict(), "about_me": am.as_dict() if am else None}
        for ts, t, am in rows
    ]


# Kept as an alias — the Flask route layer calls this name.
get_new_orders = get_new_orders_for_student


def get_new_student_by_phone(phone: str):
    """Get new student by phone number"""
    session = get_session()
    rows = session.scalars(select(NewStudent).where(NewStudent.phone == phone)).all()
    return [n.as_dict() for n in rows]


def get_all_classes(admin_user_id: str):
    """Get all classes (admin validated), with student discount nested"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    stmt = select(Classes, Student.discount).outerjoin(Student, Student.user_id == Classes.student_user_id)
    rows = session.execute(stmt).all()
    result = []
    for cls, discount in rows:
        d = cls.as_dict()
        d["students"] = {"discount": discount} if cls.student_user_id else None
        result.append(d)
    return result


def get_class_by_teacher_and_student_id(admin_user_id: str, teacher_user_id: str, student_user_id: str):
    """Get class by teacher and student ID (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()
    rows = session.scalars(
        select(Classes).where(Classes.teacher_user_id == teacher_user_id, Classes.student_user_id == student_user_id)
    ).all()
    return [c.as_dict() for c in rows]


def get_classes_by_teacher(user_id: str):
    """Get all classes for a teacher"""
    session = get_session()
    rows = session.scalars(select(Classes).where(Classes.teacher_user_id == user_id)).all()
    return [c.as_dict() for c in rows]


def get_classes_by_ids(class_ids: list[str]):
    """Get multiple classes by list of class_ids"""
    if not class_ids:
        return []

    session = get_session()
    rows = session.scalars(select(Classes).where(Classes.class_id.in_(class_ids))).all()
    return [c.as_dict() for c in rows]


def get_student_for_teacher(teacher_user_id: str):
    """Get distinct students accepted for a teacher"""
    session = get_session()
    stmt = (
        select(Student)
        .distinct()
        .join(TeacherStudent, TeacherStudent.student_user_id == Student.user_id)
        .where(
            TeacherStudent.teacher_user_id == teacher_user_id,
            TeacherStudent.teacher_accepted_student.is_(True),
            or_(TeacherStudent.hidden.is_(None), TeacherStudent.hidden.isnot(True)),
        )
    )
    rows = session.scalars(stmt).all()
    return [s.as_dict() for s in rows]


def get_student_by_email(email: str):
    """Get student by email"""
    session = get_session()
    rows = session.scalars(select(Student).where(Student.email_parent == email)).all()
    return [s.as_dict() for s in rows]


def get_teacher_by_email(email: str):
    """Get teacher by email"""
    session = get_session()
    rows = session.scalars(select(Teacher).where(Teacher.email == email)).all()
    return [t.as_dict() for t in rows]


def get_teacher_for_student(student_user_id: str):
    """Get teachers accepted for a student"""
    session = get_session()
    stmt = (
        select(Teacher)
        .join(TeacherStudent, TeacherStudent.teacher_user_id == Teacher.user_id)
        .where(
            TeacherStudent.student_user_id == student_user_id,
            TeacherStudent.teacher_accepted_student.is_(True),
            or_(TeacherStudent.hidden.is_(None), TeacherStudent.hidden.isnot(True)),
        )
    )
    rows = session.scalars(stmt).all()
    return [t.as_dict() for t in rows]


def get_classes_for_student(student_user_id: str):
    """Get classes for student with teacher info nested"""
    session = get_session()
    stmt = select(Classes, Teacher).outerjoin(Teacher, Teacher.user_id == Classes.teacher_user_id).where(
        Classes.student_user_id == student_user_id
    )
    rows = session.execute(stmt).all()
    result = []
    for cls, teacher in rows:
        d = cls.as_dict()
        d["teachers"] = teacher.as_dict() if teacher else None
        result.append(d)
    return result


def get_classes_for_teacher(teacher_user_id: str):
    """Get all classes for a teacher"""
    session = get_session()
    rows = session.scalars(select(Classes).where(Classes.teacher_user_id == teacher_user_id)).all()
    return [c.as_dict() for c in rows]


def get_about_me_text(user_id: str):
    """Get about_me text for a user"""
    session = get_session()
    rows = session.scalars(select(AboutMeText.about_me).where(AboutMeText.user_id == user_id)).all()
    return [{"about_me": row} for row in rows]


def get_all_about_me_texts():
    """Get all about_me texts"""
    session = get_session()
    stmt = select(
        AboutMeText.user_id, AboutMeText.about_me, AboutMeText.firstname, AboutMeText.lastname, AboutMeText.image_url
    )
    rows = session.execute(stmt).all()
    return [dict(row._mapping) for row in rows]


def get_all_quizzes():
    """Get all quizzes"""
    session = get_session()
    rows = session.scalars(select(Quiz)).all()
    return [q.as_dict() for q in rows]


def get_quiz_meta_data(quiz_id: str):
    """Get quiz metadata by quiz_id"""
    session = get_session()
    rows = session.scalars(select(Quiz).where(Quiz.quiz_id == quiz_id)).all()
    return [q.as_dict() for q in rows]


def get_quiz(quiz_id: str):
    """Get all questions for a quiz"""
    session = get_session()
    rows = session.scalars(select(Question).where(Question.quiz_id == quiz_id)).all()
    questions = [q.as_dict() for q in rows]

    for question in questions:
        if "answer_options" in question and isinstance(question["answer_options"], str):
            try:
                answer_str = question["answer_options"]
                answer_str = answer_str.replace("{", "[", 1)
                answer_str = answer_str[::-1].replace("}", "]", 1)[::-1]
                answer_str = answer_str.replace('\\"', '"')
                answer_str = re.sub(r'(?<=[,\[])\s*([^",\[\]]+)\s*(?=[,\]])', r'"\1"', answer_str)
                question["answer_options"] = json.loads(answer_str)
            except (json.JSONDecodeError, TypeError, ValueError):
                pass

    return questions


def get_quiz_status(user_id: str):
    """Get quiz status for a user (combines quizzes and results)"""
    session = get_session()
    quizzes = [q.as_dict() for q in session.scalars(select(Quiz)).all()]
    results = [r.as_dict() for r in session.scalars(select(QuizResult).where(QuizResult.user_id == user_id)).all()]

    status = []
    for quiz in quizzes:
        match = next((r for r in results if r["quiz_id"] == quiz["quiz_id"]), {})
        status.append({"quiz": quiz, "result": match})
    return status


def get_all_reviews():
    """Get all reviews"""
    session = get_session()
    rows = session.scalars(select(Review)).all()
    return [r.as_dict() for r in rows]


def get_available_subjects(teacher_user_id: str):
    """Get all subjects a teacher is qualified to teach"""
    session = get_session()
    rows = session.scalars(select(AvailableSubject).where(AvailableSubject.teacher_user_id == teacher_user_id)).all()
    return [a.as_dict() for a in rows]


def get_all_available_subjects():
    """Get all available subjects"""
    session = get_session()
    rows = session.scalars(select(AvailableSubject)).all()
    return [a.as_dict() for a in rows]


def get_all_quiz_types():
    """Get all quiz types"""
    session = get_session()
    rows = session.scalars(select(Quiz)).all()
    return [q.as_dict() for q in rows]


def get_teacher_student():
    """Get all active teacher-student relationships, nested as {relation, teacher, student}"""
    session = get_session()
    stmt = (
        select(TeacherStudent, Teacher, Student)
        .outerjoin(Teacher, Teacher.user_id == TeacherStudent.teacher_user_id)
        .outerjoin(Student, Student.user_id == TeacherStudent.student_user_id)
        .where(or_(TeacherStudent.hidden.is_(None), TeacherStudent.hidden.is_(False)))
    )
    rows = session.execute(stmt).all()
    return [
        {
            "relation": ts.as_dict(),
            "teacher": teacher.as_dict() if teacher else None,
            "student": student.as_dict() if student else None,
        }
        for ts, teacher, student in rows
    ]


def get_students_with_few_classes(days: int):
    """
    Get students with few classes: active students with no class started after
    the cutoff, paired with their earliest non-hidden teacher_student relation
    (with a non-resigned teacher), and most recent class.

    Matches the *live* Postgres function body (introspected via
    pg_get_functiondef), which has diverged from the checked-in
    supabase_rpc_functions.sql: the live version filters ts.hidden = false and
    t.resigned = false, and dedupes the last-class join with
    `LEFT JOIN LATERAL ... LIMIT 1` rather than the file's undeduplicated
    version. This ROW_NUMBER()-based rewrite reproduces that LATERAL/LIMIT-1
    behavior exactly (verified against the live RPC's output).
    """
    session = get_session()
    threshold_date = (datetime.now(timezone.utc) - timedelta(days=days)).date()

    non_hidden_ts = select(TeacherStudent).where(TeacherStudent.hidden.is_(False)).subquery("non_hidden_ts")
    earliest_ts_rn = func.row_number().over(
        partition_by=non_hidden_ts.c.student_user_id, order_by=non_hidden_ts.c.created_at.asc()
    )
    earliest_ts = select(non_hidden_ts, earliest_ts_rn.label("rn")).subquery("earliest_ts")
    earliest_ts_alias = select(earliest_ts).where(earliest_ts.c.rn == 1).subquery("earliest_ts_filtered")

    last_class_rn = func.row_number().over(
        partition_by=Classes.student_user_id, order_by=Classes.started_at.desc()
    )
    last_class = (
        select(Classes.student_user_id, Classes.started_at, Classes.class_id, last_class_rn.label("rn"))
        .where(Classes.started_at.isnot(None))
        .subquery("last_class")
    )
    last_class_filtered = select(last_class).where(last_class.c.rn == 1).subquery("last_class_filtered")

    has_recent_class = exists(
        select(1).where(
            Classes.student_user_id == Student.user_id,
            func.cast(Classes.started_at, Date) > threshold_date,
        )
    )

    ts_cols = [c for c in TeacherStudent.__table__.columns]

    stmt = (
        select(
            Student,
            Teacher,
            *[earliest_ts_alias.c[c.name].label(f"ts_{c.name}") for c in ts_cols],
            last_class_filtered.c.started_at.label("last_class_started_at"),
            last_class_filtered.c.class_id.label("last_class_id"),
        )
        .join(earliest_ts_alias, earliest_ts_alias.c.student_user_id == Student.user_id)
        .join(Teacher, Teacher.user_id == earliest_ts_alias.c.teacher_user_id)
        .outerjoin(last_class_filtered, last_class_filtered.c.student_user_id == Student.user_id)
        .where(Student.status == "active", Teacher.status == "active", ~has_recent_class)
    )

    rows = session.execute(stmt).mappings().all()
    result = []
    for row in rows:
        student = row[Student]
        teacher = row[Teacher]
        result.append(
            {
                "student": student.as_dict(),
                "teacher_student": {c.name: row[f"ts_{c.name}"] for c in ts_cols},
                "teacher": teacher.as_dict(),
                "last_class_started_at": row["last_class_started_at"],
                "last_class_id": row["last_class_id"],
            }
        )
    return result


def get_all_admins():
    """Get all admin teachers"""
    session = get_session()
    rows = session.scalars(select(Teacher).where(Teacher.admin.is_(True))).all()
    return [t.as_dict() for t in rows]


def get_all_teachers_join_students():
    """Get all teachers joined with students (accepted, non-hidden, active teacher)"""
    session = get_session()
    stmt = (
        select(Student, TeacherStudent, Teacher)
        .join(TeacherStudent, TeacherStudent.student_user_id == Student.user_id)
        .join(Teacher, Teacher.user_id == TeacherStudent.teacher_user_id)
        .where(
            Teacher.status == "active",
            or_(TeacherStudent.teacher_accepted_student.is_(True), TeacherStudent.teacher_accepted_student.is_(None)),
            or_(TeacherStudent.hidden.is_(False), TeacherStudent.hidden.is_(None)),
        )
    )
    rows = session.execute(stmt).all()
    result = []
    for student, ts, teacher in rows:
        d = student.as_dict()
        ts_dict = ts.as_dict()
        ts_dict["teachers"] = teacher.as_dict()
        d["teacher_student"] = ts_dict
        result.append(d)
    return result


def get_students_without_teacher():
    """Get active students without an accepted, active teacher"""
    session = get_session()
    has_teacher = (
        select(TeacherStudent.student_user_id)
        .join(Teacher, Teacher.user_id == TeacherStudent.teacher_user_id)
        .where(
            TeacherStudent.teacher_accepted_student.is_(True),
            or_(TeacherStudent.hidden.is_(False), TeacherStudent.hidden.is_(None)),
            Teacher.status == "active",
        )
    )
    rows = session.scalars(
        select(Student).where(Student.user_id.not_in(has_teacher), Student.status == "active")
    ).all()
    return [s.as_dict() for s in rows]


def get_teachers_without_about_me():
    """Get teachers without about_me text"""
    session = get_session()
    teachers = session.execute(
        select(Teacher.user_id, Teacher.firstname, Teacher.lastname, Teacher.email).where(Teacher.status == "active")
    ).all()
    about_me_user_ids = set(session.scalars(select(AboutMeText.user_id)).all())

    return [dict(row._mapping) for row in teachers if row.user_id not in about_me_user_ids]


def get_teachers_without_quizes():
    """Get teachers without quiz results"""
    session = get_session()
    teachers = session.execute(
        select(Teacher.user_id, Teacher.firstname, Teacher.lastname, Teacher.email).where(Teacher.status == "active")
    ).all()
    quiz_user_ids = set(session.scalars(select(QuizResult.user_id)).all())

    return [dict(row._mapping) for row in teachers if row.user_id not in quiz_user_ids]


def get_analytics_dashboard(admin_user_id: str):
    """Get comprehensive analytics dashboard data (admin validated)"""
    if not is_admin(admin_user_id):
        raise ValueError("User is not an admin")

    session = get_session()

    classes_stmt = (
        select(Classes, Teacher, Student.discount)
        .outerjoin(Teacher, Teacher.user_id == Classes.teacher_user_id)
        .outerjoin(Student, Student.user_id == Classes.student_user_id)
        .where(Classes.was_canselled.is_(False))
    )
    classes_rows = session.execute(classes_stmt).all()
    classes = []
    for cls, teacher, discount in classes_rows:
        d = cls.as_dict()
        d["teachers"] = (
            {"hourly_pay": teacher.hourly_pay, "firstname": teacher.firstname, "lastname": teacher.lastname, "location": teacher.location}
            if teacher
            else None
        )
        d["students"] = {"discount": discount} if cls.student_user_id else None
        classes.append(d)

    students = [
        dict(row._mapping)
        for row in session.execute(select(Student.user_id, Student.status, Student.created_at)).all()
    ]
    teachers = [dict(row._mapping) for row in session.execute(select(Teacher.user_id, Teacher.status)).all()]
    teacher_student_relations = [
        dict(row._mapping)
        for row in session.execute(
            select(
                TeacherStudent.teacher_user_id,
                TeacherStudent.student_user_id,
                TeacherStudent.travel_pay_to_teacher,
                TeacherStudent.order_comments,
            )
        ).all()
    ]

    ts_lookup = {}
    for ts in teacher_student_relations:
        key = (ts.get("teacher_user_id"), ts.get("student_user_id"))
        ts_lookup[key] = ts

    def parse_datetime(dt_string):
        """Parse datetime string handling various formats"""
        if not dt_string:
            return None
        if isinstance(dt_string, datetime):
            return dt_string if dt_string.tzinfo else dt_string.replace(tzinfo=timezone.utc)
        try:
            dt_normalized = dt_string.replace("Z", "+00:00")
            match = re.match(r"^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})\.?(\d*)([+-]\d{2}:\d{2})?$", dt_normalized)
            if match:
                base_dt, fraction, tz = match.groups()
                if fraction:
                    fraction = fraction.ljust(6, "0")[:6]
                    dt_normalized = f"{base_dt}.{fraction}{tz or ''}"
                else:
                    dt_normalized = f"{base_dt}{tz or ''}"
            return datetime.fromisoformat(dt_normalized)
        except (ValueError, AttributeError) as e:
            print(f"Failed to parse datetime '{dt_string}': {e}")
            return None

    now = datetime.now(timezone.utc)
    year_start = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    ninety_days_ago = now - timedelta(days=90)

    total_revenue_ytd = 0
    total_profit_ytd = 0
    total_teacher_cost_ytd = 0
    total_hours_ytd = 0

    monthly_revenue = {}
    teacher_revenue = {}
    location_revenue = {}
    student_ltv = {}
    student_last_class = {}

    classes_this_week = 0
    classes_one_month_ago_week = 0
    week_start = now - timedelta(days=now.weekday())
    week_end = week_start + timedelta(days=7)
    one_month_ago = now - timedelta(days=30)
    one_month_ago_week_start = one_month_ago - timedelta(days=one_month_ago.weekday())
    one_month_ago_week_end = one_month_ago_week_start + timedelta(days=7)

    for cls in classes:
        started_at = parse_datetime(cls.get("started_at"))
        ended_at = parse_datetime(cls.get("ended_at"))

        if not started_at or not ended_at:
            continue

        if week_start <= started_at < week_end:
            classes_this_week += 1

        if one_month_ago_week_start <= started_at < one_month_ago_week_end:
            classes_one_month_ago_week += 1

        duration_hours = (ended_at - started_at).total_seconds() / 3600

        is_group = cls.get("groupclass", False)
        num_students = cls.get("number_of_students", 1) if is_group else 1
        hourly_rate = 350 if is_group else 540

        base_revenue = duration_hours * hourly_rate * num_students

        students_data = cls.get("students")
        discount = float(students_data.get("discount", 0) if students_data else 0)

        revenue = base_revenue * (1 - discount)

        teacher_hourly_pay = float(cls.get("teachers", {}).get("hourly_pay", 0)) if cls.get("teachers") else 0
        teacher_cost = duration_hours * teacher_hourly_pay

        teacher_id = cls.get("teacher_user_id")
        student_id = cls.get("student_user_id")
        ts_relation = ts_lookup.get((teacher_id, student_id), {})

        travel_cost = ts_relation.get("travel_pay_to_teacher", 0) or 0
        total_cost = teacher_cost + travel_cost

        profit = revenue - total_cost

        if started_at >= year_start:
            total_revenue_ytd += revenue
            total_profit_ytd += profit
            total_teacher_cost_ytd += total_cost
            total_hours_ytd += duration_hours

        month_key = started_at.strftime("%Y-%m")
        if month_key not in monthly_revenue:
            monthly_revenue[month_key] = {"revenue": 0, "profit": 0}
        monthly_revenue[month_key]["revenue"] += revenue
        monthly_revenue[month_key]["profit"] += profit

        if started_at >= year_start:
            teacher_id = cls.get("teacher_user_id")
            if teacher_id:
                teacher_name = (
                    f"{cls.get('teachers', {}).get('firstname', '')} {cls.get('teachers', {}).get('lastname', '')}"
                    if cls.get("teachers")
                    else "Unknown"
                )
                if teacher_id not in teacher_revenue:
                    teacher_revenue[teacher_id] = {"teacherName": teacher_name, "revenue": 0, "classCount": 0, "totalHours": 0}
                teacher_revenue[teacher_id]["revenue"] += revenue
                teacher_revenue[teacher_id]["classCount"] += 1
                teacher_revenue[teacher_id]["totalHours"] += duration_hours

        if started_at >= year_start:
            location = cls.get("teachers", {}).get("location", "Unknown") if cls.get("teachers") else "Unknown"
            if location:
                if location not in location_revenue:
                    location_revenue[location] = {"revenue": 0, "classCount": 0}
                location_revenue[location]["revenue"] += revenue
                location_revenue[location]["classCount"] += 1

        student_id = cls.get("student_user_id")
        if student_id:
            if student_id not in student_ltv:
                student_ltv[student_id] = 0
            student_ltv[student_id] += revenue

            if student_id not in student_last_class or started_at > student_last_class[student_id]:
                student_last_class[student_id] = started_at

    active_students = []
    churned_students = []
    active_marked_students = 0
    inactive_among_active = 0

    for student in students:
        student_id = student["user_id"]
        is_active = student.get("status", "active") == "active"
        last_class = student_last_class.get(student_id)

        is_churned_for_ltv = not is_active or (not last_class or last_class < ninety_days_ago)

        if is_churned_for_ltv:
            churned_students.append(student_id)
        else:
            active_students.append(student_id)

        if is_active:
            active_marked_students += 1
            if not last_class or last_class < ninety_days_ago:
                inactive_among_active += 1

    active_students_count = len(active_students)
    churn_rate = (inactive_among_active / active_marked_students * 100) if active_marked_students > 0 else 0
    active_teachers_count = sum(1 for t in teachers if t.get("status", "active") == "active")
    avg_hourly_margin = ((total_revenue_ytd - total_teacher_cost_ytd) / total_hours_ytd) if total_hours_ytd > 0 else 0

    total_ltv = sum(student_ltv.values())
    avg_ltv = total_ltv / len(student_ltv) if student_ltv else 0

    ltv_buckets = [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
    ltv_distribution = []

    for i in range(len(ltv_buckets) - 1):
        start = ltv_buckets[i]
        end = ltv_buckets[i + 1]
        active_count = sum(1 for sid in active_students if start <= student_ltv.get(sid, 0) < end)
        churned_count_bucket = sum(1 for sid in churned_students if start <= student_ltv.get(sid, 0) < end)

        ltv_distribution.append(
            {"rangeLabel": f"{start}-{end}", "rangeStart": start, "rangeEnd": end, "activeCount": active_count, "churnedCount": churned_count_bucket}
        )

    active_count_final = sum(1 for sid in active_students if student_ltv.get(sid, 0) >= 100000)
    churned_count_final = sum(1 for sid in churned_students if student_ltv.get(sid, 0) >= 100000)
    ltv_distribution.append(
        {"rangeLabel": "100000+", "rangeStart": 100000, "rangeEnd": None, "activeCount": active_count_final, "churnedCount": churned_count_final}
    )

    twelve_months_ago = now - timedelta(days=365)
    revenue_by_month = []
    for month_key in sorted(monthly_revenue.keys()):
        month_date = datetime.strptime(month_key, "%Y-%m")
        if month_date.replace(tzinfo=timezone.utc) >= twelve_months_ago:
            revenue_by_month.append(
                {"month": month_key, "revenue": monthly_revenue[month_key]["revenue"], "profit": monthly_revenue[month_key]["profit"]}
            )

    revenue_by_teacher = [
        {"teacherId": teacher_id, "teacherName": data["teacherName"], "revenue": data["revenue"], "classCount": data["classCount"], "totalHours": data["totalHours"]}
        for teacher_id, data in sorted(teacher_revenue.items(), key=lambda x: x[1]["revenue"], reverse=True)
    ]

    revenue_by_location = [
        {"location": location, "revenue": data["revenue"], "classCount": data["classCount"]}
        for location, data in sorted(location_revenue.items(), key=lambda x: x[1]["revenue"], reverse=True)
    ]

    return {
        "totalRevenueYTD": round(total_revenue_ytd, 2),
        "totalProfitYTD": round(total_profit_ytd, 2),
        "activeStudentsCount": active_students_count,
        "activeTeachersCount": active_teachers_count,
        "averageHourlyMargin": round(avg_hourly_margin, 2),
        "averageLTVPerStudent": round(avg_ltv, 2),
        "churnRate": round(churn_rate, 2),
        "classesThisWeek": classes_this_week,
        "classesOneMonthAgoWeek": classes_one_month_ago_week,
        "ltvDistribution": ltv_distribution,
        "revenueByMonth": revenue_by_month,
        "revenueByTeacher": revenue_by_teacher,
        "revenueByLocation": revenue_by_location,
    }


# ============================================================================
# GRATIS LEKSEHJELP (FREE HOMEWORK HELP) QUERY FUNCTIONS
# ============================================================================


def get_teacher_help_config(teacher_user_id: str):
    """Get help config for a specific teacher"""
    session = get_session()
    row = session.scalar(select(TeacherHelpConfig).where(TeacherHelpConfig.teacher_user_id == teacher_user_id))
    return row.as_dict() if row else None


def get_all_available_teachers():
    """Get all teachers available for help with their config"""
    session = get_session()
    stmt = (
        select(TeacherHelpConfig, Teacher)
        .join(Teacher, Teacher.user_id == TeacherHelpConfig.teacher_user_id)
        .where(TeacherHelpConfig.available_for_help.is_(True))
    )
    rows = session.execute(stmt).all()
    result = []
    for config, teacher in rows:
        d = config.as_dict()
        d["teachers"] = teacher.as_dict()
        result.append(d)
    return result


def get_active_help_sessions():
    """Get currently active help sessions (based on day/time, recurring or one-time)"""
    session = get_session()

    # Mirrors the original RPC's `CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Oslo'` —
    # computed via SQL functions rather than in Python so Postgres (not this
    # process) remains the source of truth for "now" and for the timestamptz ->
    # time-of-day cast, matching production semantics exactly.
    oslo_now = func.timezone("Europe/Oslo", func.current_timestamp())
    now_utc_col = func.current_timestamp()

    queue_count_subq = (
        select(HelpQueue.assigned_session_id, func.count(HelpQueue.queue_id).label("queue_count"))
        .where(HelpQueue.status == "waiting")
        .group_by(HelpQueue.assigned_session_id)
        .subquery()
    )

    recurring_match = and_(
        HelpSession.recurring.is_(True),
        HelpSession.day_of_week == func.extract("isodow", oslo_now) - 1,
        func.cast(oslo_now, Time) >= func.cast(HelpSession.start_time, Time),
        func.cast(oslo_now, Time) < func.cast(HelpSession.end_time, Time),
    )
    one_time_match = and_(HelpSession.recurring.is_(False), now_utc_col >= HelpSession.start_time, now_utc_col < HelpSession.end_time)

    stmt = (
        select(
            HelpSession,
            Teacher.firstname,
            Teacher.lastname,
            func.coalesce(queue_count_subq.c.queue_count, 0).label("queue_count"),
        )
        .join(Teacher, Teacher.user_id == HelpSession.teacher_user_id)
        .join(TeacherHelpConfig, TeacherHelpConfig.teacher_user_id == HelpSession.teacher_user_id)
        .outerjoin(queue_count_subq, queue_count_subq.c.assigned_session_id == HelpSession.session_id)
        .where(HelpSession.is_active.is_(True), TeacherHelpConfig.available_for_help.is_(True), or_(recurring_match, one_time_match))
        .order_by(func.coalesce(queue_count_subq.c.queue_count, 0).asc())
    )
    rows = session.execute(stmt).all()
    return [
        {
            "session_id": hs.session_id,
            "teacher_user_id": hs.teacher_user_id,
            "recurring": hs.recurring,
            "day_of_week": hs.day_of_week,
            "start_time": hs.start_time,
            "end_time": hs.end_time,
            "queue_count": queue_count,
            "teacher_firstname": firstname,
            "teacher_lastname": lastname,
            "zoom_join_link": hs.zoom_link,
        }
        for hs, firstname, lastname, queue_count in rows
    ]


def get_help_sessions_for_teacher(teacher_user_id: str):
    """Get all help sessions for a teacher, which are not completed yet"""
    session = get_session()
    now_utc = datetime.now(timezone.utc)
    stmt = select(HelpSession).where(
        HelpSession.teacher_user_id == teacher_user_id,
        or_(HelpSession.end_time >= now_utc, HelpSession.recurring.is_(True)),
        HelpSession.is_active.is_(True),
    )
    rows = session.scalars(stmt).all()
    return [h.as_dict() for h in rows]


def get_help_queue_for_session(session_id: str):
    """Get queue for a specific session, ordered by position"""
    session = get_session()
    stmt = (
        select(HelpQueue)
        .where(HelpQueue.assigned_session_id == session_id, HelpQueue.status == "waiting")
        .order_by(HelpQueue.position)
    )
    rows = session.scalars(stmt).all()
    return [q.as_dict() for q in rows]


def get_queue_position(queue_id: str):
    """Get position and info for a queue entry"""
    session = get_session()
    stmt = (
        select(HelpQueue, HelpSession.teacher_user_id)
        .outerjoin(HelpSession, HelpSession.session_id == HelpQueue.assigned_session_id)
        .where(HelpQueue.queue_id == queue_id)
    )
    row = session.execute(stmt).first()
    if not row:
        return None
    queue_entry, teacher_user_id = row
    d = queue_entry.as_dict()
    d["help_sessions"] = {"teacher_user_id": teacher_user_id} if teacher_user_id else None
    return d


def get_all_uncompleted_help_sessions():
    """Get all future help sessions (recurring + one-time sessions that haven't ended)"""
    session = get_session()
    now_utc = datetime.now(timezone.utc)
    stmt = (
        select(HelpSession, Teacher.firstname, Teacher.lastname, Teacher.user_id)
        .join(Teacher, Teacher.user_id == HelpSession.teacher_user_id)
        .where(HelpSession.is_active.is_(True), or_(HelpSession.end_time >= now_utc, HelpSession.recurring.is_(True)))
    )
    rows = session.execute(stmt).all()
    result = []
    for hs, firstname, lastname, teacher_user_id in rows:
        d = hs.as_dict()
        d["teachers"] = {"firstname": firstname, "lastname": lastname, "user_id": teacher_user_id}
        result.append(d)
    return result

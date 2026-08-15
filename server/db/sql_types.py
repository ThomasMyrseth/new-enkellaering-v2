from typing import Optional
from datetime import datetime
from dataclasses import dataclass, field

@dataclass
class Teacher:
    user_id: str                       # REQUIRED
    firstname: str                     # REQUIRED
    lastname: str                      # REQUIRED
    email: str                         # REQUIRED
    phone: Optional[str] = None        # NULLABLE
    address: Optional[str] = None      # NULLABLE
    postal_code: Optional[str] = None  # NULLABLE
    hourly_pay: Optional[str] = None   # NULLABLE
    additional_comments: Optional[str] = None  # NULLABLE
    created_at: Optional[datetime] = field(default_factory=datetime.utcnow)  # NULLABLE, default CURRENT_TIMESTAMP()
    admin: Optional[bool] = False      # NULLABLE, default FALSE
    resigned: bool = False
    resigned_at: Optional[datetime] = None  # NULLABLE
    wants_more_students: Optional[bool] = True  # NULLABLE, default TRUE
    location: Optional[str] = None     # NULLABLE; City the teacher resides in
    digital_tutouring: Optional[bool] = None  # NULLABLE; TRUE if the teacher can tutor digitally (must have an ipad)
    physical_tutouring: Optional[bool] = None # NULLABLE; TRUE if the teacher is willing to meet student in person


# STUDENTS table
class Students:
    def __init__(
        self,
        user_id: str,
        firstname_parent: str,
        lastname_parent: str,
        email_parent: str,
        phone_parent: str,
        firstname_student: str,
        lastname_student: str,
        phone_student: str,
        main_subjects: str,
        address: str,
        postal_code: str,
        has_physical_tutoring: bool,
        created_at: Optional[datetime] = None,
        additional_comments: Optional[str] = None,
        is_active: Optional[bool] = None,
        est_hours_per_week: Optional[float] = None,
    ):
        self.user_id = user_id
        self.firstname_parent = firstname_parent
        self.lastname_parent = lastname_parent
        self.email_parent = email_parent
        self.phone_parent = phone_parent
        self.firstname_student = firstname_student
        self.lastname_student = lastname_student
        self.phone_student = phone_student
        self.main_subjects = main_subjects
        self.address = address
        self.postal_code = postal_code
        self.has_physical_tutoring = has_physical_tutoring
        self.created_at = created_at or datetime.now()
        self.additional_comments = additional_comments or ""
        self.is_active = is_active or True


# CLASSES table
class Classes:
    def __init__(
        self,
        class_id: str,
        teacher_user_id: str,
        student_user_id: str,
        created_at: datetime,
        started_at: datetime,
        ended_at: datetime,
        groupclass: bool,
        number_of_students: Optional[int] = None,
        was_canselled :bool = False,
        comment: Optional[str] = None,
        paid_teacher: Optional[bool] = None,
        paid_teacher_at: Optional[str] = None,
        invoiced_student: Optional[bool] = None,
        invoiced_student_at: Optional[str] = None,
    ):
        self.class_id = class_id
        self.teacher_user_id = teacher_user_id
        self.student_user_id = student_user_id
        self.created_at = created_at
        self.started_at = started_at
        self.ended_at = ended_at
        self.groupclass = groupclass
        self.number_of_students = number_of_students
        self.comment = comment
        self.paid_teacher = paid_teacher
        self.invoiced_student = invoiced_student
        self.invoiced_student_at = invoiced_student_at
        self.paid_teacher_at = paid_teacher_at
        self.was_canselled = was_canselled
from typing import Optional
from datetime import datetime
from google.cloud import bigquery


# TEACHERS table
class Teachers:
    def __init__(
        self,
        user_id: str,
        firstname: str,
        lastname: str,
        email: str,
        phone: str,
        address: str,
        postal_code: str,
        hourly_pay: str,
        resigned: bool,
        additional_comments: str,
        created_at: Optional[datetime] = None,
        admin: Optional[bool] = None,
        resigned_at: Optional[datetime] = None,
    ):
        self.user_id = user_id
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.phone = phone
        self.address = address
        self.postal_code = postal_code
        self.hourly_pay = hourly_pay
        self.resigned = resigned
        self.created_at = created_at or datetime.now()
        self.admin = admin
        self.resigned_at = resigned_at
        self.additional_comments = additional_comments or ""

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
        est_hours_per_week: Optional[int] = None,
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


# REFERRALS table
class Referrals:
    def __init__(
        self,
        referral_student_phone: str,
        referee_phone: str,
        paid_referee: bool,
        referral_parent_phone: Optional[str] = None,
        referee_user_id: Optional[str] = None,
        success: Optional[bool] = None,
        paid_referee_at: Optional[datetime] = None,
        success_at: Optional[datetime] = None,
    ):
        self.referral_student_phone = referral_student_phone
        self.referee_phone = referee_phone
        self.paid_referee = paid_referee
        self.referral_parent_phone = referral_parent_phone
        self.referee_user_id = referee_user_id
        self.success = success
        self.paid_referee_at = paid_referee_at
        self.success_at = success_at

from typing import Optional
from datetime import datetime

class NewStudents:
    def __init__(
        self,
        new_student_id: str,
        phone: str,
        has_called: bool,
        created_at: datetime,
        has_answered: bool,
        has_signed_up: bool,
        from_referal: bool,
        has_finished_onboarding: bool,
        has_assigned_teacher: bool,

        called_at: Optional[datetime] = None,
        answered_at: Optional[datetime] = None,
        signed_up_at: Optional[datetime] = None,
        assigned_teacher_at: Optional[datetime] = None,
        assigned_teacher_user_id: Optional[str] = None,
        finished_onboarding_at: Optional[datetime] = None,

        referee_phone: Optional[str] = None,
        referee_name: Optional[str] = None,
        paid_referee: Optional[bool] = None,
        paid_referee_at: Optional[datetime] = None,
        
        comments: Optional[str] = None,
    ):
        self.phone = phone
        self.has_called = has_called
        self.called_at = called_at
        self.created_at = created_at
        self.has_answered = has_answered
        self.answered_at = answered_at
        self.has_signed_up = has_signed_up
        self.signed_up_at = signed_up_at
        self.from_referal = from_referal
        self.referee_phone = referee_phone
        self.has_assigned_teacher = has_assigned_teacher
        self.assigned_teacher_at = assigned_teacher_at
        self.has_finished_onboarding = has_finished_onboarding
        self.assigned_teacher_user_id = assigned_teacher_user_id
        self.finished_onboarding_at = finished_onboarding_at
        self.comments = comments
        self.referee_name = referee_name
        self.paid_referee = paid_referee
        self.paid_referee_at = paid_referee_at
        self.new_student_id = new_student_id


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
        comment: Optional[str] = None,
        paid_teacher: Optional[bool] = None,
        paid_teacher_at: Optional[str] = None,
        invoiced_student: Optional[bool] = None,
        invoiced_student_at: Optional[str] = None,
    ):
        self.class_id = class_id,
        self.teacher_user_id = teacher_user_id
        self.student_user_id = student_user_id
        self.created_at = created_at
        self.started_at = started_at
        self.ended_at = ended_at
        self.comment = comment
        self.paid_teacher = paid_teacher
        self.invoiced_student = invoiced_student
        self.invoiced_student_at = invoiced_student_at
        self.paid_teacher_at = paid_teacher_at
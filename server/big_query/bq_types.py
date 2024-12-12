from typing import Optional
from datetime import datetime

# TEACHERS table
class teachers:
    user_id: str
    firstname: str
    lastname: str
    email: str
    phone: str
    address: str
    postal_code: str
    hourly_pay: str
    resigned: bool
    created_at: Optional[datetime] = None
    admin: Optional[bool] = None
    your_teacher: Optional[str] = None
    is_active: Optional[bool] = None
    deactivated_at: Optional[datetime] = None

# STUDENTS table
class students:
    user_id: str
    firstname_parent: str
    lastname_parent: str
    email_parent: str
    phone_parent: str
    firstname_student: str
    lastname_student: str
    phone_student: str
    created_at: datetime
    main_subjects: str
    additional_comments: Optional[str] = None

# REFERRALS table
class referrals:
    referral_student_phone: str
    referral_parent_phone: Optional[str] = None
    referee_phone: str
    referee_user_id: Optional[str] = None
    paid_referee: bool
    success: Optional[bool] = None
    paid_referee_at: Optional[datetime] = None
    success_at: Optional[datetime] = None

# NEW STUDENTS table
class new_students:
    phone: str
    has_called: bool
    called_at: Optional[datetime] = None
    has_answered: bool
    answered_at: Optional[datetime] = None
    has_signed_up: bool
    signed_up_at: Optional[datetime] = None
    from_referral: bool
    referee_phone: Optional[str] = None
    has_assigned_teacher: Optional[bool] = None
    assigned_teacher_at: Optional[datetime] = None
    has_finished_onboarding: Optional[bool] = None
    finished_onboarding_at: Optional[datetime] = None
    comments: Optional[str] = None

# CLASSES table
class classes:
    teacher_user_id: str
    student_user_id: str
    created_at: datetime
    started_at: datetime
    ended_at: datetime
    comment: Optional[str] = None
    paid_teacher: Optional[bool] = None
    invoiced_student: Optional[bool] = None
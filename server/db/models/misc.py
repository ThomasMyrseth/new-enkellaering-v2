import datetime
import uuid as uuid_module

from sqlalchemy import (
    ARRAY,
    BigInteger,
    Boolean,
    DateTime,
    ForeignKeyConstraint,
    Identity,
    Index,
    Integer,
    JSON,
    PrimaryKeyConstraint,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base


class AboutMeText(Base):
    __tablename__ = "about_me_texts"
    __table_args__ = (
        ForeignKeyConstraint(["user_id"], ["teachers.user_id"], ondelete="CASCADE", name="fk_about_me_teacher"),
        PrimaryKeyConstraint("user_id", name="about_me_texts_pkey"),
        Index("idx_about_me_name", "firstname", "lastname"),
        {"comment": "Teacher profile descriptions and bios"},
    )

    user_id: Mapped[str] = mapped_column(Text, primary_key=True)
    about_me: Mapped[str | None] = mapped_column(Text)
    firstname: Mapped[str | None] = mapped_column(Text)
    lastname: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    image_url: Mapped[str | None] = mapped_column(
        Text, comment="Public URL to teacher profile image stored in Supabase Storage"
    )

    teacher = relationship("Teacher", foreign_keys=[user_id])


class AvailableSubject(Base):
    __tablename__ = "available_subjects"
    __table_args__ = (
        ForeignKeyConstraint(
            ["teacher_user_id"], ["teachers.user_id"], name="available_subjects_teacher_user_id_fkey"
        ),
        PrimaryKeyConstraint("id", name="available_subjects_pkey"),
        {"comment": "a list of subjects each teacher is qualified to teach in"},
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
        primary_key=True,
    )
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    teacher_user_id: Mapped[str | None] = mapped_column(Text, server_default=text("gen_random_uuid()"))
    subject: Mapped[str | None] = mapped_column(Text)

    teacher = relationship("Teacher", foreign_keys=[teacher_user_id])


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        ForeignKeyConstraint(["student_user_id"], ["students.user_id"], ondelete="CASCADE", name="fk_review_student"),
        ForeignKeyConstraint(["teacher_user_id"], ["teachers.user_id"], ondelete="CASCADE", name="fk_review_teacher"),
        PrimaryKeyConstraint("id", name="reviews_pkey"),
        Index("idx_reviews_created", "created_at"),
        Index("idx_reviews_student", "student_user_id"),
        Index("idx_reviews_teacher", "teacher_user_id"),
        {"comment": "Student reviews of teachers"},
    )

    id: Mapped[uuid_module.UUID] = mapped_column(Uuid, primary_key=True)
    teacher_user_id: Mapped[str | None] = mapped_column(Text)
    student_user_id: Mapped[str | None] = mapped_column(Text)
    student_name: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    rating: Mapped[int | None] = mapped_column(Integer, comment="Numeric rating (typically 1-5)")
    comment: Mapped[str | None] = mapped_column(Text)

    teacher = relationship("Teacher", foreign_keys=[teacher_user_id])
    student = relationship("Student", foreign_keys=[student_user_id])


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        ForeignKeyConstraint(["student"], ["students.user_id"], ondelete="SET NULL", name="tasks_student_fkey"),
        ForeignKeyConstraint(["teacher"], ["teachers.user_id"], name="tasks_teacher_fkey"),
        PrimaryKeyConstraint("id", name="tasks_pkey"),
        Index("idx_tasks_completed", "completed"),
        Index("idx_tasks_status", "status"),
        Index("idx_tasks_student", "student"),
        Index("idx_tasks_teacher_ids", "teacher_ids", postgresql_using="gin"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        Identity(always=True, start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1),
        primary_key=True,
    )
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    status: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str | None] = mapped_column(Text)
    teacher_ids: Mapped[list[str] | None] = mapped_column(ARRAY(Text()))
    student: Mapped[str | None] = mapped_column(Text, server_default=text("'NULL'::text"))
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    # Live column not documented in the stale schema.sql dump — confirmed via
    # sqlacodegen reflection of the real database.
    teacher: Mapped[str | None] = mapped_column(Text)

    student_ref = relationship("Student", foreign_keys=[student])
    teacher_ref = relationship("Teacher", foreign_keys=[teacher])


class JobApplication(Base):
    __tablename__ = "job_applications"
    __table_args__ = (
        PrimaryKeyConstraint("uuid", name="job_applications_pkey"),
        {"comment": "Teacher job applications"},
    )

    uuid: Mapped[uuid_module.UUID] = mapped_column(Uuid, primary_key=True)
    firstname: Mapped[str | None] = mapped_column(Text)
    lastname: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(Text)
    resumelink: Mapped[str | None] = mapped_column(
        Text, comment="Public URL to resume stored in Supabase Storage"
    )
    subject: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    grades: Mapped[str | None] = mapped_column(Text)


class NewStudent(Base):
    __tablename__ = "new_students"
    __table_args__ = (
        PrimaryKeyConstraint("new_student_id", name="new_students_pkey"),
        Index("idx_new_students_created_at", "created_at"),
        Index("idx_new_students_phone", "phone"),
        Index("idx_new_students_referal", "from_referal"),
        Index("idx_new_students_signed_up", "has_signed_up"),
        {"comment": "Lead tracking for potential new students"},
    )

    new_student_id: Mapped[uuid_module.UUID] = mapped_column(Uuid, primary_key=True)
    phone: Mapped[str | None] = mapped_column(Text)
    has_called: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - tracking call attempts")
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    called_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    has_answered: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - tracking call success")
    answered_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    has_signed_up: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - converted to student")
    signed_up_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    from_referal: Mapped[bool | None] = mapped_column(Boolean)
    referee_phone: Mapped[str | None] = mapped_column(Text)
    has_finished_onboarding: Mapped[bool | None] = mapped_column(Boolean)
    finished_onboarding_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    comments: Mapped[str | None] = mapped_column(Text)
    paid_referee: Mapped[bool | None] = mapped_column(Boolean)
    paid_referee_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    referee_name: Mapped[str | None] = mapped_column(Text)
    hidden: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - soft delete flag")
    preffered_teacher: Mapped[str | None] = mapped_column(Text)
    referee_account_number: Mapped[str | None] = mapped_column(Text)
    meta: Mapped[dict | None] = mapped_column(JSON, comment='Lead attribution, e.g. {"source": "meta"|"google"|"organic"}')


class TeacherReferral(Base):
    __tablename__ = "teacher_referrals"
    __table_args__ = (
        ForeignKeyConstraint(
            ["referee_teacher_user_id"], ["teachers.user_id"], ondelete="CASCADE", name="fk_referral_teacher"
        ),
        PrimaryKeyConstraint("uid", name="teacher_referrals_pkey"),
        Index("idx_teacher_referrals_created", "created_at"),
        Index("idx_teacher_referrals_referee", "referee_teacher_user_id"),
        Index("idx_teacher_referrals_teacher", "referee_teacher_user_id"),
        {"comment": "Teacher referral program tracking"},
    )

    uid: Mapped[uuid_module.UUID] = mapped_column(Uuid, primary_key=True)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    referee_teacher_user_id: Mapped[str | None] = mapped_column(
        Text, comment="User ID of the teacher who made the referral"
    )
    referral_name: Mapped[str | None] = mapped_column(Text)
    referral_phone: Mapped[str | None] = mapped_column(Text)
    referral_email: Mapped[str | None] = mapped_column(Text)

    teacher = relationship("Teacher", foreign_keys=[referee_teacher_user_id])


class Waitlist(Base):
    __tablename__ = "waitlist"
    __table_args__ = (
        PrimaryKeyConstraint("id", name="waitlist_pkey"),
        UniqueConstraint("email", name="waitlist_email_key"),
        Index("idx_waitlist_email", "email"),
        Index("idx_waitlist_notified", "notified"),
    )

    id: Mapped[uuid_module.UUID] = mapped_column(Uuid, primary_key=True, server_default=text("gen_random_uuid()"))
    email: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    notified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    phone: Mapped[str | None] = mapped_column(Text)

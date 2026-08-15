import datetime
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKeyConstraint,
    Index,
    Integer,
    PrimaryKeyConstraint,
    Text,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base


class HelpSession(Base):
    __tablename__ = "help_sessions"
    __table_args__ = (
        CheckConstraint("day_of_week IS NULL OR day_of_week >= 0 AND day_of_week <= 6", name="check_day_of_week"),
        ForeignKeyConstraint(["created_by_user_id"], ["teachers.user_id"], name="fk_help_session_creator"),
        ForeignKeyConstraint(
            ["teacher_user_id"], ["teachers.user_id"], ondelete="CASCADE", name="fk_help_session_teacher"
        ),
        PrimaryKeyConstraint("session_id", name="help_sessions_pkey"),
        Index("idx_help_sessions_active", "is_active"),
        Index("idx_help_sessions_day", "day_of_week", postgresql_where=text("(recurring = true)")),
        Index("idx_help_sessions_recurring", "recurring"),
        Index("idx_help_sessions_teacher", "teacher_user_id"),
        {
            "comment": "Help sessions - supports both recurring weekly and one-time "
            "date-specific sessions"
        },
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text("gen_random_uuid()"))
    teacher_user_id: Mapped[str] = mapped_column(Text, nullable=False)
    recurring: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="If true, session repeats weekly on day_of_week. If false, session is one-time on session_date.",
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    created_by_user_id: Mapped[str] = mapped_column(Text, nullable=False)
    day_of_week: Mapped[int | None] = mapped_column(
        Integer, comment="Day of week for recurring sessions (0=Monday, 6=Sunday). NULL for one-time sessions."
    )
    end_time: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    start_time: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    zoom_link: Mapped[str | None] = mapped_column(Text)

    teacher = relationship("Teacher", foreign_keys=[teacher_user_id])
    creator = relationship("Teacher", foreign_keys=[created_by_user_id])


class HelpQueue(Base):
    __tablename__ = "help_queue"
    __table_args__ = (
        CheckConstraint(
            "status = ANY (ARRAY['waiting'::text, 'admitted'::text, 'completed'::text, 'no_show'::text])",
            name="check_status",
        ),
        ForeignKeyConstraint(
            ["assigned_session_id"], ["help_sessions.session_id"], ondelete="SET NULL", name="fk_queue_session"
        ),
        ForeignKeyConstraint(["preferred_teacher_id"], ["teachers.user_id"], ondelete="SET NULL", name="fk_queue_teacher"),
        PrimaryKeyConstraint("queue_id", name="help_queue_pkey"),
        Index("idx_help_queue_created", "created_at"),
        Index("idx_help_queue_session", "assigned_session_id"),
        Index("idx_help_queue_status", "status"),
        {"comment": "Queue for students waiting for help"},
    )

    queue_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text("gen_random_uuid()"))
    student_name: Mapped[str] = mapped_column(Text, nullable=False)
    subject: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("'waiting'::text"), comment="Status: waiting, admitted, completed, no_show"
    )
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    student_email: Mapped[str | None] = mapped_column(Text)
    student_phone: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    preferred_teacher_id: Mapped[str | None] = mapped_column(Text)
    assigned_session_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)
    position: Mapped[int | None] = mapped_column(Integer, comment="Position in queue (1 = first)")
    admitted_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))

    preferred_teacher = relationship("Teacher", foreign_keys=[preferred_teacher_id])
    assigned_session = relationship("HelpSession", foreign_keys=[assigned_session_id])


class TeacherHelpConfig(Base):
    __tablename__ = "teacher_help_config"
    __table_args__ = (
        ForeignKeyConstraint(["teacher_user_id"], ["teachers.user_id"], ondelete="CASCADE", name="fk_help_config_teacher"),
        PrimaryKeyConstraint("teacher_user_id", name="teacher_help_config_pkey"),
        Index("idx_help_config_available", "available_for_help"),
        {"comment": "Configuration for teachers providing free homework help"},
    )

    teacher_user_id: Mapped[str] = mapped_column(Text, primary_key=True)
    available_for_help: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="Whether teacher is currently available for help sessions",
    )
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    teacher = relationship("Teacher", foreign_keys=[teacher_user_id])

import datetime
import uuid

from sqlalchemy import (
    Boolean,
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


class TeacherStudent(Base):
    __tablename__ = "teacher_student"
    __table_args__ = (
        ForeignKeyConstraint(
            ["student_user_id"], ["students.user_id"], ondelete="SET NULL", name="teacher_student_student_user_id_fkey"
        ),
        ForeignKeyConstraint(
            ["teacher_user_id"], ["teachers.user_id"], ondelete="SET NULL", name="teacher_student_teacher_user_id_fkey"
        ),
        PrimaryKeyConstraint("row_id", name="teacher_student_pkey"),
        Index("idx_teacher_student_accepted", "teacher_accepted_student"),
        Index("idx_teacher_student_created", "created_at"),
        Index("idx_teacher_student_hidden", "hidden", postgresql_where=text("((hidden IS NULL) OR (hidden = false))")),
        Index("idx_teacher_student_student", "student_user_id"),
        Index("idx_teacher_student_teacher", "teacher_user_id"),
        {"comment": "Teacher-student relationship assignments and orders"},
    )

    row_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    teacher_user_id: Mapped[str | None] = mapped_column(Text)
    student_user_id: Mapped[str | None] = mapped_column(Text)
    teacher_accepted_student: Mapped[bool | None] = mapped_column(
        Boolean, comment="TRUE/FALSE/NULL - teacher acceptance status"
    )
    physical_or_digital: Mapped[bool | None] = mapped_column(
        Boolean, server_default=text("false"), comment="TRUE=physical, FALSE=digital tutoring"
    )
    preferred_location: Mapped[str | None] = mapped_column(Text, server_default=text("''::text"))
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    hidden: Mapped[bool | None] = mapped_column(
        Boolean, server_default=text("false"), comment="TRUE/FALSE string - soft delete flag"
    )
    order_comments: Mapped[str | None] = mapped_column(Text)
    travel_pay_to_teacher: Mapped[int | None] = mapped_column(Integer, server_default=text("0"))
    travel_pay_from_student: Mapped[int | None] = mapped_column(Integer, server_default=text("0"))

    teacher = relationship("Teacher", foreign_keys=[teacher_user_id])
    student = relationship("Student", foreign_keys=[student_user_id])

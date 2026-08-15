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


class Classes(Base):
    __tablename__ = "classes"
    __table_args__ = (
        ForeignKeyConstraint(["student_user_id"], ["students.user_id"], ondelete="SET NULL", name="fk_class_student"),
        ForeignKeyConstraint(["teacher_user_id"], ["teachers.user_id"], ondelete="SET NULL", name="fk_class_teacher"),
        PrimaryKeyConstraint("class_id", name="classes_pkey"),
        Index("idx_classes_ended_at", "ended_at"),
        Index("idx_classes_invoiced", "invoiced_student", postgresql_where=text("(invoiced_student = false)")),
        Index("idx_classes_paid", "paid_teacher", postgresql_where=text("(paid_teacher = false)")),
        Index("idx_classes_started_at", "started_at"),
        Index("idx_classes_student", "student_user_id"),
        Index("idx_classes_teacher", "teacher_user_id"),
        {"comment": "Individual tutoring sessions and their billing status"},
    )

    class_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    teacher_user_id: Mapped[str | None] = mapped_column(Text)
    student_user_id: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    started_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    comment: Mapped[str | None] = mapped_column(Text)
    paid_teacher: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - has teacher been paid")
    invoiced_student: Mapped[bool | None] = mapped_column(
        Boolean, comment="TRUE/FALSE string - has student been invoiced"
    )
    was_canselled: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - was session cancelled")
    invoiced_student_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    paid_teacher_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    groupclass: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - is this a group session")
    number_of_students: Mapped[int | None] = mapped_column(Integer)

    teacher = relationship("Teacher", foreign_keys=[teacher_user_id])
    student = relationship("Student", foreign_keys=[student_user_id])

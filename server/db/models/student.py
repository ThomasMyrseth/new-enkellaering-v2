import datetime

from sqlalchemy import Boolean, DateTime, Double, Index, PrimaryKeyConstraint, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base


class Student(Base):
    __tablename__ = "students"
    __table_args__ = (
        PrimaryKeyConstraint("user_id", name="students_pkey"),
        Index("idx_students_active", "is_active", postgresql_where=text("(is_active = true)")),
        Index("idx_students_email", "email_parent"),
        Index("idx_students_name", "firstname_student", "lastname_student"),
        {"comment": "Student profiles with parent and student information"},
    )

    user_id: Mapped[str] = mapped_column(Text, primary_key=True)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    firstname_parent: Mapped[str | None] = mapped_column(Text)
    lastname_parent: Mapped[str | None] = mapped_column(Text)
    email_parent: Mapped[str | None] = mapped_column(Text)
    phone_parent: Mapped[str | None] = mapped_column(Text)
    firstname_student: Mapped[str | None] = mapped_column(Text)
    lastname_student: Mapped[str | None] = mapped_column(Text)
    phone_student: Mapped[str | None] = mapped_column(Text)
    address: Mapped[str | None] = mapped_column(Text)
    postal_code: Mapped[str | None] = mapped_column(Text)
    main_subjects: Mapped[str | None] = mapped_column(Text)
    has_physical_tutoring: Mapped[bool | None] = mapped_column(Boolean)
    additional_comments: Mapped[str | None] = mapped_column(Text)
    est_hours_per_week: Mapped[float | None] = mapped_column(Double(53))
    is_active: Mapped[bool | None] = mapped_column(
        Boolean, comment="TRUE/FALSE bool - indicates if student account is active"
    )
    notes: Mapped[str | None] = mapped_column(Text)
    discount: Mapped[float | None] = mapped_column(Double(53), server_default=text("'0'::double precision"))

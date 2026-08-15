import datetime

from sqlalchemy import Boolean, DateTime, Index, PrimaryKeyConstraint, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base


class Teacher(Base):
    __tablename__ = "teachers"
    __table_args__ = (
        PrimaryKeyConstraint("user_id", name="teachers_pkey"),
        Index("idx_teachers_name", "firstname", "lastname"),
        Index("idx_teachers_resigned", "resigned", postgresql_where=text("(resigned = false)")),
        {"comment": "Teacher profiles and account information"},
    )

    user_id: Mapped[str] = mapped_column(Text, primary_key=True)
    firstname: Mapped[str | None] = mapped_column(Text)
    lastname: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(Text)
    address: Mapped[str | None] = mapped_column(Text)
    postal_code: Mapped[str | None] = mapped_column(Text)
    hourly_pay: Mapped[str | None] = mapped_column(Text)
    additional_comments: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    admin: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE bool - indicates admin privileges")
    resigned: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE bool - indicates if teacher has resigned")
    resigned_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    location: Mapped[str | None] = mapped_column(Text)
    digital_tutouring: Mapped[bool | None] = mapped_column(Boolean, server_default=text("false"))
    physical_tutouring: Mapped[bool | None] = mapped_column(Boolean, server_default=text("false"))
    notes: Mapped[str | None] = mapped_column(Text)

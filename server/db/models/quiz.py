import datetime
import uuid

from sqlalchemy import (
    Boolean,
    DateTime,
    Double,
    ForeignKeyConstraint,
    Index,
    Integer,
    PrimaryKeyConstraint,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base


class Quiz(Base):
    __tablename__ = "quizzes"
    __table_args__ = (
        PrimaryKeyConstraint("quiz_id", name="quizzes_pkey"),
        {"comment": "Quiz metadata and configuration"},
    )

    quiz_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    title: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(
        Text, comment="Public URL to quiz cover image stored in Supabase Storage"
    )
    pass_threshold: Mapped[float | None] = mapped_column(Double(53), comment='Percentage required to pass (e.g., "80")')
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))
    number_of_questions: Mapped[int | None] = mapped_column(Integer)
    content: Mapped[str | None] = mapped_column(Text)


class Question(Base):
    __tablename__ = "questions"
    __table_args__ = (
        ForeignKeyConstraint(["quiz_id"], ["quizzes.quiz_id"], ondelete="CASCADE", name="fk_question_quiz"),
        PrimaryKeyConstraint("question_id", name="questions_pkey"),
        Index("idx_questions_quiz", "quiz_id"),
        {"comment": "Individual questions belonging to quizzes"},
    )

    question_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    quiz_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)
    question: Mapped[str | None] = mapped_column(Text)
    answer_options: Mapped[str | None] = mapped_column(Text, comment="JSON or delimited string of answer choices")
    correct_option: Mapped[int | None] = mapped_column(Integer)
    image_url: Mapped[str | None] = mapped_column(Text, comment="Public URL to question image stored in Supabase Storage")
    time_limit: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))

    quiz = relationship("Quiz", foreign_keys=[quiz_id])


class QuizResult(Base):
    __tablename__ = "quiz_results"
    __table_args__ = (
        ForeignKeyConstraint(["quiz_id"], ["quizzes.quiz_id"], ondelete="CASCADE", name="fk_quiz_result_quiz"),
        ForeignKeyConstraint(["user_id"], ["teachers.user_id"], ondelete="CASCADE", name="fk_quiz_result_user"),
        PrimaryKeyConstraint("attempt_id", name="quiz_results_pkey"),
        Index("idx_quiz_results_created", "created_at"),
        Index("idx_quiz_results_quiz", "quiz_id"),
        Index("idx_quiz_results_user", "user_id"),
        {"comment": "Quiz attempt results for teachers (qualifications)"},
    )

    attempt_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(Text)
    quiz_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)
    passed: Mapped[bool | None] = mapped_column(Boolean, comment="TRUE/FALSE string - indicates if quiz was passed")
    number_of_corrects: Mapped[int | None] = mapped_column(Integer)
    number_of_questions: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True))

    teacher = relationship("Teacher", foreign_keys=[user_id])
    quiz = relationship("Quiz", foreign_keys=[quiz_id])

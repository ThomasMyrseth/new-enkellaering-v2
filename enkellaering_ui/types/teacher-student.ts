import { Teacher } from "./teacher";
import { Student } from "./student";

// Mirrors server/db/models/teacher_student.py (TeacherStudent) — the
// `teacher_student` table's own columns, minus the teacher_user_id/
// student_user_id FKs (implied by `teacher.user_id`/`student.user_id` below).
export type TeacherStudentRelation = {
    row_id: string;
    teacher_accepted_student: boolean | null;
    physical_or_digital: boolean | null;
    preferred_location: string | null;
    order_comments: string | null;
    created_at: string | null;
    hidden: boolean | null;
    travel_pay_to_teacher: number | null;
    travel_pay_from_student: number | null;
};

// Nested shape returned by GET /get-teacher-student (server/db/gets.py:get_teacher_student).
// `teacher`/`student` are null only if the relation's FK points at a row that
// no longer exists — the backend does an outer join so a dangling FK doesn't
// drop the relation entirely.
export type TeacherStudent = {
    relation: TeacherStudentRelation;
    teacher: Teacher | null;
    student: Student | null;
};

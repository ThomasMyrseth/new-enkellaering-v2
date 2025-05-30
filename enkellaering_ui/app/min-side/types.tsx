export type Student = {
    user_id: string,
    firstname_parent: string,
    lastname_parent: string,
    email_parent: string,
    phone_parent: string,

    firstname_student: string,
    lastname_student: string,
    phone_student: string,

    main_subjects: string,
    address: string,
    postal_code: string,
    has_physical_tutoring: boolean,
    created_at: string,
    additional_comments: string,
    your_teacher: string

    est_hours_per_week :number
    is_active :boolean
    notes :string
}

export type Teacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    hourly_pay: string;
    resgined: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
}

export type Classes = {
    comment: string; // Optional comment for the session
    created_at: string; // Timestamp when the record was created (ISO format)
    started_at: string; // Timestamp for when the session started (ISO format)
    ended_at: string; // Timestamp for when the session ended (ISO format)
    invoiced_student: boolean; // Indicates if the student was invoiced
    paid_teacher: boolean; // Indicates if the teacher was paid
    was_canselled :boolean;
};

export type Review = {
    id :string; //id of the review
    teacher_user_id :string; //teacher user id
    student_user_id :string; //the one leaving the revie
    student_name :string //the name to be displayed
    created_at :string;
    rating :number //1-5
    comment :string;
}

export type TeacherOrder = {
    row_id :string;
    teacher_user_id :string;
    student_user_id :string;
    teacher_accepted_student :boolean | null;
    physical_or_digital :boolean;
    preferred_location :string;
    order_comments :string;
    created_at :string;
    hidden :boolean;
}

export type TeacherOrderJoinTeacher = {
    teacher :Teacher;
    order :TeacherOrder;
}

export type TeacherOrderWithTeacherData = {
  additional_comments: string;
  address: string;
  admin: boolean;
  created_at: string;
  digital_tutouring: boolean;
  email: string;
  firstname: string;
  hidden: boolean;
  hourly_pay: string;
  lastname: string;
  location: string;
  order_comments: string;
  phone: string;
  physical_or_digital: boolean;
  physical_tutouring: boolean;
  postal_code: string;
  preferred_location: string;
  resigned: boolean;
  resigned_at: string | null;
  row_id: string;
  student_user_id: string;
  teacher_accepted_student: boolean | null;
  teacher_user_id: string;
  travel_pay_from_student: number | null;
  travel_pay_to_teacher: number | null;
  user_id: string;
}
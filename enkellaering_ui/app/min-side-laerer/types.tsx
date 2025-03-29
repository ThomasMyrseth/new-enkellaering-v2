import { ReactNode } from "react";

export type ExpandableCardType = {
    description: string;
    title: string;
    status: string;
    src: string;
    ctaText: string;
    ctaLink: string;
    content: () => ReactNode;
}


export type QuizResult = {
    created_at: string; // Timestamp as a string
    number_of_corrects: number;
    number_of_questions: number;
    passed: boolean;
    quiz_id: string;
    user_id: string;
  };
  
  export type Quiz = {
    created_at: string; // Timestamp as a string
    image: string; // URL string
    pass_threshold: number;
    quiz_id: string;
    title: string;
    content: string;
  };
  
  export type QuizStatus = {
    quiz: Quiz;
    result: QuizResult| null;
  };


import { TeacherOrder } from "../min-side/types";
import { Student } from "../admin/types";


export type NewTeacherOrder = {
  additional_comments: string;
  additional_comments_1: string;
  address: string;
  address_1: string;
  admin: boolean;
  created_at: string;
  created_at_1: string;
  created_at_2: string;
  digital_tutouring: boolean;
  email: string;
  email_parent: string;
  est_hours_per_week: number;
  firstname: string;
  firstname_parent: string;
  firstname_student: string;
  has_physical_tutoring: boolean;
  hidden: null | string;
  hourly_pay: string;
  is_active: boolean;
  lastname: string;
  lastname_parent: string;
  lastname_student: string;
  location: null | string;
  main_subjects: string;
  notes: string;
  order_comments: string;
  phone: string;
  phone_parent: string;
  phone_student: string;
  physical_or_digital: boolean;
  physical_tutouring: boolean;
  postal_code: string;
  postal_code_1: string;
  preferred_location: string;
  resigned: boolean;
  resigned_at: null | string;
  row_id: string;
  student_user_id: string;
  teacher_accepted_student: null | boolean;
  teacher_user_id: string;
  user_id: string;
  user_id_1: string;
  wants_more_students: null | boolean;
  wants_more_students_1: boolean;
  your_teacher: null | string;
};
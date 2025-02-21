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
  };
  
  export type QuizStatus = {
    quiz: Quiz;
    result: QuizResult| null;
  };
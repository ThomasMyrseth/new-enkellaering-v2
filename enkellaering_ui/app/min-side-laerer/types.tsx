

export type ExpandableCardType = {
    description: string;
    title: string;
    status: string;
    src: string;
    ctaText: string;
    ctaLink: string;
    content: string;
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
  content: string;
  created_at: string; // Timestamp as a string
  image_url: string; // URL string
  number_of_questions: number;
  pass_threshold: number;
  quiz_id: string;
  title: string;
};

export type QuizStatus = {
  quiz: Quiz;
  result: QuizResult| null;
};



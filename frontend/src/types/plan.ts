export interface Answer {
  question: number,
  selected_answer: number;
}

export interface Source {
  title: string;
  url: string;
}
  
export interface Question {
  id: number;
  question: string;
  answers: { id: number; content: string }[];
  user_answer: string | null;
}

export interface Subtopic {
  plan: Plan;
  id: string;
  name: string;
  preview: string;
  content: string | null;
  questions: Question[];
}

export interface Item {
  theme: string;
  hours: number;
  subtopics: Subtopic[];
}

export interface Plan {
  id: string;
  chat_session: string;
  sources: Source[];
  topic: string;
  total_hours: number;
  items: Item[];
}
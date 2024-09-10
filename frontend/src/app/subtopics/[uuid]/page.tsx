'use client'

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useParams, useRouter } from "next/navigation";
import { SquareLoader } from "react-spinners";
import { toast } from "sonner";

import { Subtopic, Question, Answer } from "@/types";
import { Footer, Header, Title, Container } from '@/components/shared';
import { markdownToHtml } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  RadioGroup,
  RadioGroupItem,
  Label
} from "@/components/ui";
import { apiRequest } from "@/lib/apiClient";

interface CheckedAnswerObject {
  [key: number]: {
      correct: boolean;
      correct_answers: number[];
  };
}

interface CheckedQuestion {
  question: number;
  correct: boolean;
  correct_answers: number[];
};

const useSubtopic = (cookies: { refresh: string | undefined }, uuid: string | string[]) => {
  const router = useRouter();
  const [subtopicData, setSubtopicData] = useState<Subtopic | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const [checkedAnswers, setCheckedAnswers] = useState<CheckedAnswerObject>({});
  const [isAnswersSubmitted, setIsAnswersSubmitted] = useState<boolean>(false);
  
  const correctAnswers = Object.values(checkedAnswers).filter(answer => answer.correct).length;

  useEffect(() => {
    if (!cookies.refresh) {
      router.replace('/login');
      return;
    }
  })

  const fetchSubtopic = useCallback(async () => {
    try {
      const response = await apiRequest('get', `plans/subtopics/${uuid}`, false);
      if (response) {
        setSubtopicData(response);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      router.replace('/404');
    }
  }, [uuid, router]);

  const shuffleArray = (array: any[]) =>
    array.map(item => ({ sort: Math.random(), value: item }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  
  const fetchAndShuffleQuestions = async() => {
    setIsGenerating(true);
    setSelectedAnswers([]);
    setCheckedAnswers({});

    try {
      const response = await apiRequest('post', `plans/subtopics/${uuid}/generate_questions/`, true);
  
      const shuffledQuestions = response.map((question: Question) => ({
        ...question,
        answers: shuffleArray([...question.answers])
      }));
  
      setSubtopicData((prevData) => {
        if (prevData == null) {
          return null;
        }
  
        return {
          ...prevData,
          questions: shuffledQuestions
        };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswers = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (selectedAnswers.length === (subtopicData?.questions.length || 0)) {
      try {
        const response = await apiRequest('post', `plans/subtopics/${uuid}/submit_answers/`, true, {
          answers: selectedAnswers
        });
        
        const resultObject = response.reduce((acc: CheckedAnswerObject, checkedQuestion: CheckedQuestion) => {
          acc[checkedQuestion.question] = {
            correct: checkedQuestion.correct,
            correct_answers: checkedQuestion.correct_answers
          };
          
          return acc;
        }, {})
        
        setIsAnswersSubmitted(true);
        setCheckedAnswers(resultObject);
      } catch (error) {
        console.error(error);
      }
    } else {
      toast.error('You must answer all available questions before submitting.', {
        description: 'Please ensure you have selected an answer for each question.'
      })
    }
  };

  const updateSelectedAnswers = (selectedAnswerId: string, questionId: number) => {
    const selectedAnswer = Number(selectedAnswerId);

    setSelectedAnswers(prevAnswers => {
      const answerExists = prevAnswers.some(userAnswer => userAnswer.question === questionId);
  
      if (answerExists) {
        return prevAnswers.map(userAnswer => {
          if (userAnswer.question === questionId) {
            return {
              ...userAnswer,
              selected_answer: selectedAnswer
            };
          }
          return userAnswer;
        });
      } else {
        return [
          ...prevAnswers,
          {
            question: questionId,
            selected_answer: selectedAnswer,
          },
        ];
      }
    });
  };

  useEffect(() => {
    fetchSubtopic();
  }, [fetchSubtopic]);

  useEffect(() => {
    const convertMarkdownToHtml = async () => {
      const html = await markdownToHtml(subtopicData?.content || '');
      setHtmlContent(html);
    }

    convertMarkdownToHtml();
  }, [subtopicData?.content]);

  return {
    subtopicData,
    htmlContent,
    isLoading,
    isGenerating,
    selectedAnswers,
    checkedAnswers,
    isAnswersSubmitted,
    correctAnswers,
    fetchAndShuffleQuestions,
    submitAnswers,
    updateSelectedAnswers
  }
}

export default function SubtopicPage() {

  const { uuid } = useParams();
  const [cookies] = useCookies(['refresh']);
  const {
    subtopicData,
    htmlContent,
    isLoading,
    isGenerating,
    checkedAnswers,
    isAnswersSubmitted,
    correctAnswers,
    fetchAndShuffleQuestions,
    submitAnswers,
    updateSelectedAnswers
  } = useSubtopic({refresh: cookies.refresh}, uuid);

  const renderQuestions = () => {
    return (
      subtopicData?.questions.map(question => {
        return (
          <div className="space-y-6" key={question.id}>
            <Title size="xxs" text={question.question} />
            <RadioGroup onValueChange={(e) => updateSelectedAnswers(e, question.id)} disabled={isAnswersSubmitted}>
              {question.answers.map(answer => (
                <div key={answer.id}>
                  <RadioGroupItem value={answer.id.toString()} id={answer.id.toString()} className={checkedAnswers[question.id] ? (checkedAnswers[question.id].correct_answers.includes(answer.id) ? 'text-green-400' : 'text-red-400') : ''} />
                  <Label htmlFor={answer.id.toString()} className={`ml-2 text-md ${checkedAnswers[question.id] ? (!checkedAnswers[question.id].correct_answers.includes(answer.id) ? 'text-red-400' : 'text-green-400') : ''}`}>{answer.content}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      })
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${isLoading ? 'flex items-center justify-center' : ''}`}>
        {isLoading ? (
          <SquareLoader size={35} speedMultiplier={0.8} />
        ) : (
          <Container className="mt-28 space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/plans/${subtopicData?.plan.id}`}>{subtopicData?.plan.topic}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>{subtopicData?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="space-y-20 lg:space-y-14">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              <div className="space-y-5">
                <Title text="Questions" className="font-bold" />
                <div>
                  {(subtopicData?.questions ?? []).length > 0 ? (
                    <form className="space-y-10" onSubmit={submitAnswers}>
                      {renderQuestions()}
                      {isAnswersSubmitted && (
                        <p>You scored <span className="font-bold">{correctAnswers} / {subtopicData?.questions.length}</span> correct answers. {correctAnswers < 5 ? 'Want to practice more?' : 'Great result!'}</p>
                      )}
                      <div className="space-x-10">
                        <Button type="submit" disabled={isAnswersSubmitted}>
                          {isAnswersSubmitted ? 'Submitted' : 'Submit Questions'}
                        </Button>
                        {isAnswersSubmitted && (
                          <Button variant='outline' disabled={isGenerating} onClick={fetchAndShuffleQuestions}>
                            {isGenerating ? 'Generating...' : 'Generate New Questions'}
                          </Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <p>No questions found for this subtopic.</p>
                      <Button variant='outline' disabled={isGenerating} onClick={fetchAndShuffleQuestions}>
                        {isGenerating ? 'Generating...' : 'Generate Questions'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        )}
      </main>
      <Footer className={isLoading ? 'mt-auto' : ''} />
    </div>
  );
}

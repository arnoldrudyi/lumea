'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Title } from '@/components/shared';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
} from "@/components/ui";
import { cn } from '@/lib/utils';
import { Subtopic } from '@/types';
import { apiRequest } from '@/lib/apiClient';

interface Props {
   className?: string;
   theme: string;
   hours: number;
   subtopics: Subtopic[];
}

export const PlanItem: React.FC<Props> = ({ className, theme, hours, subtopics }) => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [subtopicState, setSubtopicState] = useState<Subtopic[]>(subtopics);

  const generateContent = async (subtopicID: string) => {
    setIsGenerating(true);

    try {
      const response = await apiRequest('post', `/plans/subtopics/${subtopicID}/generate_content/`, true);
      setSubtopicState(prevSubtopics =>
        prevSubtopics.map(subtopic =>
          subtopic.id === subtopicID
            ? { ...subtopic, content: response}
            : subtopic
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubtopicClick = (subtopic: Subtopic) => {
    if (!subtopic.content) {
      generateContent(subtopic.id);
    } else {
      router.push(`/subtopics/${subtopic.id}`);
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <Title size="xs" text={theme} className="font-bold" />
        <p className="text-sm text-muted-foreground font-bold">
          {hours} {hours > 1 ? 'hours' : 'hour'}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {subtopicState.map((subtopic, index) => (
          <AccordionItem value={`value-${index}`} key={subtopic.id}>
            <AccordionTrigger>{subtopic.name}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-y-5">
              <p>{subtopic.preview}</p>
              <Button
                variant="outline"
                size="sm"
                className="font-bold"
                onClick={() => handleSubtopicClick(subtopic)}
                disabled={!!isGenerating}
              >
                {subtopic.content ? 'Open Subtopic' : (isGenerating ? 'Generating...' : 'Generate Content')}
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
import React from 'react';

import { Title } from '@/components/shared';
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui"

interface Props {
   className?: string;
}

export const Faq: React.FC<Props> = ({ className }) => {
   return (
      <div className={className}>
        <Title text='FAQs' size='md' className='w-full xl:w-1/2 font-bold mb-10'/>
        <div>
           <Accordion type='single' collapsible className='w-full xl:w-2/3'>
            <AccordionItem value='item-1'>
              <AccordionTrigger>How does Lumea create personalized study plans?</AccordionTrigger>
              <AccordionContent>
                  Lumea generates personalized study plans by analyzing your chosen topic and the amount of time you wish to dedicate. It then sources relevant information from the web and organizes it into a structured plan, helping you focus on the most important aspects efficiently.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger>Can I ask Llama 3.1 any question related to my study plan?</AccordionTrigger>
              <AccordionContent>
                  Yes, you can ask Llama 3.1 any questions related to your study topics. Whether you need clarification on a concept, additional resources, or help with a specific problem, Llama 3.1 is here to assist you in real-time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
              <AccordionTrigger>What kind of quizzes can Lumea generate?</AccordionTrigger>
              <AccordionContent>
                  Lumea can generate targeted quizzes based on the content of your study plan. These quizzes are designed to test your understanding of key concepts, helping reinforce your knowledge and track your progress.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-4'>
              <AccordionTrigger>Is the information sourced by Lumea always accurate?</AccordionTrigger>
              <AccordionContent>
                  While Lumea strives to provide the most relevant and accurate information, it’s important to verify the content since it’s sourced from the internet. We recommend cross-referencing with trusted resources to ensure accuracy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-5'>
              <AccordionTrigger>How can I get the most out of using Lumea?</AccordionTrigger>
              <AccordionContent>
                  To maximize your learning experience with Lumea, start by setting clear study goals and selecting topics of genuine interest. Engage actively with your study plan, take the generated quizzes, and regularly interact with Llama 3.1 for deeper understanding and clarification.
              </AccordionContent>
            </AccordionItem>
           </Accordion>
        </div>
      </div>
   );
};
'use client';

import React, { useEffect, memo } from 'react';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { Title } from '@/components/shared';
import { BookMarked, Sparkles, QuestionFile } from '@/components/svgs';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui';
import Autoplay from "embla-carousel-autoplay";
import { useMediaQuery } from 'react-responsive';

interface Props {
   className?: string;
}

interface FeatureCardProps {
   icon: React.ReactNode;
   title: string;
   description: string;
   imgSrc: string;
   imgWidth: number;
   imgHeight: number;
   imgAlt: string;
}

const FeatureCard: React.FC<FeatureCardProps> = memo(({ icon, title, description, imgSrc, imgWidth, imgHeight, imgAlt }) => (
   <div className='flex flex-col gap-y-3 relative w-[325px] h-[400px] bg-card rounded-xl overflow-hidden pl-8 pt-6 border-card border-[1px]'>
     {icon}
     <p className='font-bold text-[1.375rem]'>{title}</p>
     <p className='text-[1.063rem] leading-none w-64'>{description}</p>
     <Image src={imgSrc} width={imgWidth} height={imgHeight} alt={imgAlt} className='absolute -bottom-2 shadow-md pointer-events-none' loading='lazy' />
   </div>
));

FeatureCard.displayName = 'FeatureCard';

export const Features: React.FC<Props> = ({ className }) => {
   useEffect(() => {
      AOS.init({ once: true });
   }, []);

   const isMediumScreen = useMediaQuery({ query: '(min-width: 768px)' });

   const featuresData = [
      {
        icon: <BookMarked />,
        title: 'Your study planner',
        description: 'Create personalized study plans from top internet sources. Tailor your learning path and stay organized with ease.',
        imgSrc: '/study-planner-preview.png',
        imgWidth: 292,
        imgHeight: 203,
        imgAlt: 'study planner preview',
      },
      {
        icon: <Sparkles />,
        title: 'Your AI Study Buddy',
        description: 'Chat with Llama 3.1 to dive deeper into your study topics. Get instant answers and insights to enhance your learning experience.',
        imgSrc: '/chat-preview.png',
        imgWidth: 264,
        imgHeight: 264,
        imgAlt: 'chat preview',
      },
      {
        icon: <QuestionFile />,
        title: 'Your knowledge checker',
        description: 'Generate targeted questions to test your understanding. Reinforce your learning and ensure you\'re on track.',
        imgSrc: '/questions-preview.png',
        imgWidth: 292,
        imgHeight: 203,
        imgAlt: 'questions preview',
      }
   ];

   return (
      <div className={className}>
         <Title text='AI Tools to Elevate Your Learning Experience' size='md' className='w-full xl:w-1/2 font-bold mb-10'/>
         <p className='text-md md:text-xl lg:w-3/4 xl:w-2/3 mb-10'>Streamline your study sessions with AI-driven tools. Create personalized plans, generate quizzes, and chat with Llama 3.1 for instant help. Achieve more in less time with intelligent, tailored support.</p>
         <div className='hidden xl:flex gap-x-20' data-aos='fade-up' data-aos-duration='1000'>
				{featuresData.map((feature, index) => (
				   <FeatureCard key={index} {...feature} />
				))}
         </div>
         <Carousel className='block xl:hidden' plugins={[
            Autoplay({
               delay: 3000,
            }),
         ]} opts={{
            slidesToScroll: typeof(window) !== 'undefined' && window.innerWidth < 768 ? 1 : 2,
         }}>
            <CarouselContent>
               {featuresData.map((feature, index) => (
                  <CarouselItem key={index} className='flex justify-center items-center md:basis-1/2'>
                     <FeatureCard {...feature} />
                  </CarouselItem>
               ))}
            </CarouselContent>
         </Carousel>
      </div>
   );
};
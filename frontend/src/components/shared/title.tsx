import React from 'react';
import { cn } from '@/lib/utils';

type TitleSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

interface Props {
   size?: TitleSize;
   className?: string;
   text: string;
}

export const Title: React.FC<Props> = ({ className, size = 'sm', text }) => {
   const mapTagBySize ={
     xxs: 'h5',
     xs: 'h4',
     sm: 'h3',
     md: 'h2',
     lg: 'h1'
   } as const;

   const mapClassNameBySize = {
     xxs: 'text-base font-bold',
     xs: 'text-2xl',
     sm: 'text-3xl',
     md: 'text-3xl md:text-5xl',
     lg: 'text-5xl md:text-6xl lg:text-7xl'
   } as const;

   return React.createElement(
     mapTagBySize[size],
     {
       className: cn(className, mapClassNameBySize[size])
     },
     text
   )
};
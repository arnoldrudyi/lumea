import React from 'react';

import { cn } from '@/lib/utils';
import { GithubLogo } from '@/components/svgs'

interface Props {
   className?: string;
}

export const Footer: React.FC<Props> = ({ className }) => {
   return (
      <footer className={cn('relative flex mx-auto w-screen max-w-[1200px] mt-32', className)}>
        <div className='absolute top-0 bg-border h-[1px] w-full'></div>
        <div className='w-full flex my-8 justify-between px-5'>
            <p>built by Arnold Rudyi</p>
            <a href='https://github.com/arnoldrudyi/lumea' target='_blank'>
               <GithubLogo className="text-[#6E6E6E] hover:text-foreground transition duration-300" />
            </a>
        </div>
      </footer>
   );
};
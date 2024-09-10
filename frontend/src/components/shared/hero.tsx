'use client';

import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { cn } from '@/lib/utils';
import { Title } from '@/components/shared';
import { Button } from '@/components/ui';

interface Props {
   className?: string;
}

export const Hero: React.FC<Props> = ({ className }) => {
   const router = useRouter();

   useEffect(() => {
      AOS.init({ once: true });
   }, []);

   return (
    <div className={cn('flex flex-col items-center', className)}>
      <Title size='lg' className='font-bold w-full md:w-fit mb-4' text='Plan. Learn. Achieve.'/>
      <p className='w-full md:max-w-[750px] text-xl md:text-2xl md:text-center'>Personalized study plans crafted to help you master skills efficiently and achieve your goals faster.</p>
      <Button className='text-base group relative align-middle mt-10 w-full md:w-fit' onClick={() => router.push('/dashboard')}>
        Start Mastering
        <ArrowRight size={14} className='ml-3 transition duration-300 group-hover:translate-x-1' strokeWidth={3}/>
      </Button>
      <div className='hidden justify-center relative mt-32 w-[90vw] md:flex' data-aos='fade-up' data-aos-duration='1500'>
        <Image src='/preview-light.png' width={1200} height={927} alt='preview' className='pointer-events-none rounded-md border-[#9e9e9ece] shadow-xl' style={{borderWidth: '0.5px'}} />
        <div className="absolute inset-x-0 bg-gradient-to-t from-white from-[18%] to-55% bottom-0 h-full translate-y-24"></div>
      </div>
      <div className='relative mt-16 w-[90vw] h-[25rem] bg-card rounded-md border border-card shadow-sm md:hidden' data-aos='fade-up' data-aos-duration='700'>
        <Image src='/preview-light-mobile.png' width={317} height={366} alt='preview' className='pointer-events-none absolute bottom-0 right-0 shadow-sm' />
      </div>
    </div>
   );
};
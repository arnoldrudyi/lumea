'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { AlignJustify, X, Bot } from 'lucide-react';

import { cn } from '@/lib/utils';
import { LogoLight } from '@/components/svgs';
import { Button } from '@/components/ui';
import { apiRequest } from '@/lib/apiClient';
import { LayoutDashboard, GithubLogo } from '@/components/svgs';
import { set } from 'react-hook-form';

interface Props {
   className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['access', 'refresh']);
  const [isBorderActive, setIsBorderActive] = useState<boolean>(false);
  const [isNavOpened, setIsNavOpened] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  const logoutAccount = async () => {
    try {
      const response = await apiRequest('post', '/auth/logout/', true, { refresh: cookies.refresh });
      if (response) {
        removeCookie('refresh');
        removeCookie('access');
      } 
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const refreshAccess = async() => {
      try {
        const response = await apiRequest('post', 'auth/token/refresh', true, { refresh: cookies.refresh });
        if (response?.access) {
          setCookie('refresh', response.refresh, { path: '/', maxAge: (3600 * 24) * 30 })
          setCookie('access', response.access, { path: '/', maxAge: (3600 * 24) * 5 })
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (cookies.refresh && !cookies.access) {
      refreshAccess();
    }
  }, [cookies.refresh, cookies.access]);

  useEffect(() => {
    if (isNavOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpened]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY !== 0) {
        setIsBorderActive(true);
      } else {
        setIsBorderActive(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const accessCookie = cookies.access;
    const refreshCookie = cookies.refresh;

    setIsAuthorized(!!accessCookie && !!refreshCookie);
  }, [cookies]);

  const toggleMobileNavBar = () => {
    if (!isNavOpened && !isBorderActive) {
      setIsBorderActive(true);
    } else if (isNavOpened && window.scrollY === 0) {
      setIsBorderActive(false);
    }
    
    setIsNavOpened(!isNavOpened);
  };

  return (
    <CookiesProvider>
      <header className={cn(`flex fixed h-16 w-screen lg:w-full bg-background transition-all duration-300 justify-center z-10 top-0 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-border after:opacity-0 after:transition after:duration-300 ${isBorderActive && 'after:opacity-100'}`, className)}>
        <div className='flex justify-between items-center w-screen px-6 lg:px-10'>
            <div className='flex items-end gap-14'>
                <a href='/'><LogoLight className='cursor-pointer' /></a>
                <div className='hidden lg:flex text-lg gap-10 text-[#6E6E6E]'>
                    <a href='/dashboard'><p className='cursor-pointer hover:text-black transition-all'>Dashboard</p></a>
                    <a href='/chat'><p className='cursor-pointer hover:text-black transition-all'>Chat</p></a>
                    <a href='https://github.com/arnoldrudyi/lumea' target='_blank'><p className='cursor-pointer hover:text-black transition-all'>Contribute</p></a>
                </div>
            </div>
            <div className='hidden lg:flex gap-8 items-center text-[#6E6E6E]'>
              {!isAuthorized ? (
                <>
                  <p className='text-lg cursor-pointer hover:text-black transition-all' onClick={() => router.push('/login')}>Log in</p>
                  <Button variant='default' size='sm' onClick={() => router.push('/signup')}>Sign up</Button>
                </>
              ) : (
                <Button variant='outline' size='sm' className='text-base' onClick={logoutAccount}>Logout</Button>
              )}
            </div>
            <div onClick={toggleMobileNavBar} className='lg:hidden'>
              {isNavOpened ? <X /> : <AlignJustify />}
            </div>
            <div className={`${isNavOpened ? 'block' : 'hidden'} flex flex-col justify-between absolute z-30 bg-background w-screen px-6 py-5 h-screen top-16 left-0`}>
              <div className='space-y-4'>
                <a href='/dashboard' className='flex items-center gap-x-3'>
                    <div className='p-1 border border-border rounded-lg'>
                      <LayoutDashboard />
                    </div>
                    <span className='text-lg'>Dashboard</span>
                </a>
                <a href='/chat' className='flex items-center gap-x-3'>
                    <div className='p-1 border border-border rounded-lg'>
                      <Bot />
                    </div>
                    <span className='text-lg'>Chat</span>
                </a>
                <a href='https://github.com/arnoldrudyi/lumea' target='_blank' className='flex items-center gap-x-3'>
                    <div className='p-1 border border-border rounded-lg'>
                      <GithubLogo className="text-black" />
                    </div>
                    <span className='text-lg'>Contribute</span>
                </a>
              </div>
              <div className='relative mt-auto -translate-y-16 pt-5'>
                <span className='absolute h-[1px] bg-border top-0 w-full opacity-70'/>
                {!isAuthorized ? (
                  <div className='space-y-4'>
                    <Button variant='default' size='sm' onClick={() => router.push('/signup')} className='w-full font-bold h-[2.4rem]'>Sign up</Button>
                    <Button variant='outline' size='sm' onClick={() => router.push('/login')} className='w-full font-bold h-[2.4rem]'>Log in</Button>
                  </div>
                ) : (
                  <Button variant='outline' size='sm' onClick={logoutAccount} className='w-full font-bold h-[2.4rem]'>Logout</Button>
                )}
              </div>
            </div>
        </div>
      </header>
    </CookiesProvider>
  );
};
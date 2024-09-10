'use client';

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useRouter } from 'next/navigation';

import { LogoLight, GoogleLogo } from "@/components/svgs";
import { Container, Title } from "@/components/shared";
import { Input, Button } from "@/components/ui";
import { apiRequest } from "@/lib/apiClient";

interface Errors {
  email?: string[];
  password?: string[];
}

const capitalizeFirstLetter = (text: string) => 
  text.charAt(0).toUpperCase() + text.slice(1);

const useLogin = (setCookies: any, router: any) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  const handleInputChange = useCallback((field: keyof Errors, value: string) => {
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors[field]) {
        delete updatedErrors[field];
      }
      return updatedErrors;
    });

    field === 'email' ? setEmail(value) : setPassword(value);
  }, []);

  const parseErrors = (errorData: any) => {
    const fieldErrors: Errors = {};

    Object.keys(errorData).forEach((field) => {
      if (Array.isArray(errorData[field])) {
        fieldErrors[field as keyof Errors] = errorData[field];
      }
    });

    setErrors(fieldErrors);
  };

  const loginAccount = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('post', '/auth/login/', false, { email, password });

      if (response) {
        setCookies('access', response.access, { path: '/', maxAge: (3600 * 24) * 5 });
        setCookies('refresh', response.refresh, { path: '/', maxAge: (3600 * 24) * 30 });
        
        router.push('/dashboard');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        parseErrors(error.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, setCookies, router]);

  return {
    email,
    password,
    isLoading,
    errors,
    handleInputChange,
    loginAccount,
  };
};

export default function LoginPage() {
  const [cookies, setCookies] = useCookies(['refresh', 'access']);
  const router = useRouter();

  const {
    email,
    password,
    isLoading,
    errors,
    handleInputChange,
    loginAccount,
  } = useLogin(setCookies, router);

  useEffect(() => {
    if (cookies.access && cookies.refresh) {
      router.push('/dashboard');
    }
  }, [cookies, router]);

  return (
    <main>
      <a href="/">
        <LogoLight className="absolute right-0 left-0 mx-auto top-8" />
      </a>
      <Container className="flex flex-col space-y-6 items-center justify-center h-screen w-full max-w-[410px]">
        <div className="flex flex-col items-center">
          <Title size="sm" text="Log in to your account" className="font-bold" />
          <p className="pt-2 text-muted-foreground my-0">
            Enter your credentials below to log in
          </p>
        </div>
        <form onSubmit={loginAccount} className="grid w-full gap-3">
          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              className={errors.email ? 'border-input-error' : 'border-input'}
            />
            {errors.email && (
              <p className="text-input-error text-sm my-0">
                {capitalizeFirstLetter(errors.email[0])}
              </p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              className={errors.password ? 'border-input-error' : 'border-input'}
            />
            {errors.password && (
              <p className="text-input-error text-sm my-0">
                {capitalizeFirstLetter(errors.password[0])}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>Log in</Button>
        </form>
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center uppercase">
            <span className="bg-background px-2 text-sm text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="secondary" className="w-full" disabled>
          <GoogleLogo className="mr-2" />
          Google
        </Button>
        <p className="text-muted-foreground text-sm text-center">
          By continuing, you agree to our{' '}
          <a href="/terms-of-service" className="underline hover:text-black cursor-pointer">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy-policy" target="_blank" className="underline hover:text-black cursor-pointer">
            Privacy Policy
          </a>.
        </p>
      </Container>
    </main>
  );
}

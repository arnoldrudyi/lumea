'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { SquareLoader } from 'react-spinners';
import Image from 'next/image';

import { Footer, Header, Title, Container, PlanItem } from '@/components/shared';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui";
import { Plan } from '@/types';
import { apiRequest } from '@/lib/apiClient';

const usePlan = (cookies: { refresh: string | undefined }, uuid: string | string[]) => {
  const router = useRouter();
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!cookies.refresh) {
      router.replace('/login');
      return;
    }
    
    const fetchPlan = async () => {
      try {
        const response = await apiRequest('get', `plans/${uuid}`, false);
        if (response) {
          setPlanData(response);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        router.replace('/404');
      }
    };

    fetchPlan();
  }, [cookies.refresh, router, uuid]);

  return { planData, isLoading }
}

export default function PlanPage() {
  const { uuid } = useParams();
  const [cookies] = useCookies(['refresh']);

  const { planData, isLoading } = usePlan({ refresh: cookies.refresh }, uuid);

  const renderPlanItems = () =>
    planData?.items.map((item) => (
      <PlanItem
        key={item.theme}
        theme={item.theme}
        hours={item.hours}
        subtopics={item.subtopics}
      />
    ));

  const renderSources = () =>
    planData?.sources.map((source) => (
      <a
        key={source.url}
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-x-4"
      >
        <div className="flex gap-x-4 group cursor-pointer w-full">
          <Image
            src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${source.url}&size=128`}
            width={24}
            height={24}
            alt={`${source.title}-logo`}
            className="rounded-sm max-h-6"
          />
          <div className="w-3/4">
            <p className="font-bold text-ellipsis whitespace-nowrap overflow-hidden group-hover:underline">
              {source.title}
            </p>
            <p className="text-muted-foreground text-sm text-ellipsis whitespace-nowrap overflow-hidden">
              {source.url}
            </p>
          </div>
        </div>
      </a>
    ));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${isLoading ? 'flex items-center justify-center' : ''}`}>
        {isLoading ? (
          <SquareLoader size={35} speedMultiplier={0.8} />
        ) : (
          <Container className="mt-28 space-y-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>{planData?.topic ?? ''}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="space-y-14">
              <Title size="sm" text={planData?.topic ?? ''} className="font-bold" />
              <div className="flex flex-col lg:justify-between lg:flex-row gap-y-28">
                <div className="space-y-16 flex-initial lg:w-1/2">
                  {renderPlanItems()}
                </div>
                <div className="space-y-8 flex-initial lg:w-1/3">
                  <div className="space-y-3">
                    <Title size="sm" text="Sources" className="font-bold" />
                    <p className="text-muted-foreground">
                      The AI&apos;s response is derived from the information gathered from the sources listed below. We recommend validating the data, as generated content may not always be entirely accurate.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {renderSources()}
                  </div>
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

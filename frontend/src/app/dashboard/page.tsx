'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { Plus } from 'lucide-react';
import { SquareLoader } from 'react-spinners';

import {
  Header,
  Footer,
  Container,
  Title,
  PlanCard,
} from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Button,
} from '@/components/ui';
import { Plan } from '@/types';
import { apiRequest } from '@/lib/apiClient';

const usePlans = (cookies: { refresh: string | undefined }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (!cookies.refresh) {
      router.replace('/login');
      return;
    }

    const fetchPlans = async () => {
      try {
        const response = await apiRequest('get', '/plans', true);
        if (response) {
          setPlans(response);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPlans();
  }, [cookies.refresh, router]);

  return { plans, setPlans, isLoading };
};

const countSubtopics = (plan: Plan): number =>
  plan.items.reduce((count, item) => count + item.subtopics.length, 0);

export default function DashboardPage() {
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('');
  const [hours, setHours] = useState<number>(1);
  const [isPlanCreating, setIsPlanCreating] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [cookies] = useCookies(['refresh', 'access']);

  const { plans, setPlans, isLoading } = usePlans({refresh: cookies.refresh});

  const createChat = useCallback(
    async (topic: string, hours: number): Promise<string> => {
      try {
        const chatData = { query: topic, hours };
        const response = await apiRequest('post', '/chats/', true, chatData);
        return response?.id || '';
      } catch (error) {
        console.error(error);
        return '';
      }
    },
    []
  );

  const createPlan = useCallback(
    async (event: React.FormEvent) => {
      try {
        event.preventDefault();
        setIsPlanCreating(true);
  
        const session = await createChat(topic, hours);
        if (!session) {
          setIsPlanCreating(false);
          return;
        }
  
        const planData = { session };
        const response = await apiRequest('post', '/plans/generate/', true, planData);
        if (response) {
          setPlans((prevPlans) => [response, ...prevPlans]);
          setIsDialogOpen(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsPlanCreating(false);
      }
    },
    [topic, hours, createChat, setPlans]
  );

  const planCards = useMemo(
    () =>
      plans.map((plan) => (
        <a href={`plans/${plan.id}`} className="w-fit" key={plan.id}>
          <PlanCard
            id={plan.id}
            chatId={plan.chat_session}
            title={plan.topic}
            subtopicsCount={countSubtopics(plan)}
            hours={plan.total_hours}
            setPlans={setPlans}
            isLargeScreen = {isLargeScreen}
          />
        </a>
      )),
    [setPlans, plans, isLargeScreen]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      <Header />
      <main
        className={`flex-grow ${isLoading ? 'flex items-center justify-center' : ''}`}
      >
        {isLoading ? (
          <SquareLoader size={35} speedMultiplier={0.8} />
        ) : (
          <Container className="flex flex-col justify-center items-center xl:block mt-28 lg:mt-40 space-y-9">
            <Title size="sm" text="Studying Sessions" className="font-bold" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-6 lg:gap-x-16">
              {planCards}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger className="w-fit">
                  <div className="flex justify-center items-center gap-x-2 w-80 h-20 border-border border-dashed border rounded-lg shadow-sm cursor-pointer transition duration-300 hover:-translate-y-1 hover:border-solid hover:shadow-md">
                    <Plus width={14} height={14} />
                    Create a session
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[350px] md:max-w-lg" showCloseButton={isLargeScreen}>
                  <DialogHeader className="space-y-3">
                    <DialogTitle>New Session</DialogTitle>
                    <DialogDescription>
                      Just enter your topic and study time — you&apos;re all set!
                      That&apos;s how easy it is.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={createPlan} className="space-y-6 mt-3">
                    <div>
                      <Label htmlFor="topic">What do you want to study?</Label>
                      <Input
                        id="topic"
                        type="text"
                        placeholder="Neurophysics"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isPlanCreating}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hours">
                        How many hours do you want to study?
                      </Label>
                      <Input
                        id="hours"
                        type="number"
                        placeholder="10"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        disabled={isPlanCreating}
                      />
                    </div>
                    <Button type="submit" disabled={isPlanCreating} className={`${isLargeScreen} && w-full`}>
                      Begin Session
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Container>
        )}
      </main>
      <Footer className="mt-24 md:mt-auto" />
    </div>
  );
};

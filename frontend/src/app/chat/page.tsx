'use client';

import React, { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import { SquareLoader } from 'react-spinners';
import { toast } from "sonner";

import { Header, Footer, Container, Title } from '@/components/shared';
import { Plan } from '@/types';
import { markdownToHtml } from "@/lib/utils";
import { 
  Command,
  ScrollArea,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui";
import { Check, ChevronDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/apiClient";

interface PlanOption {
  value: string;
  label: string;
}

interface Message {
  role: string;
  content: string;
}

const convertMarkdown = async (markdown: string): Promise<string> => {
  const html = await markdownToHtml(markdown || '');
  return html;
};

export default function ChatPage() {
  const [cookies] = useCookies(['refresh', 'access']);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [userMessage, setUserMessage] = useState<string>("");

  useEffect(() => {
    if (!cookies.refresh) {
      router.replace('/login');
      return;
    }
  }, [cookies.refresh, router]);

  const fetchPlans = async () => {
    try {
      const response = await apiRequest('get', '/plans', true)
      if (response) {
        const plans: Plan[] = response;
        setPlanOptions(plans.map(plan => ({
          label: plan.topic,
          value: plan.chat_session
        })));
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChatMessages = async () => {
    if (!selectedPlan) return;

    setMessages([]);
    try {
      const response = await apiRequest('get', `/chats/${selectedPlan}`, true);
      if (response) {
        const newMessages = await Promise.all(
          response.messages.map(async (message: Message) => {
            if (message.role === 'assistant') {
              const html = await convertMarkdown(message.content);
              return { role: message.role, content: html };
            }
            return message;
          })
        );
        setMessages(newMessages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    setIsSending(true);
    setIsGenerating(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setUserMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/${selectedPlan}/send_message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        setIsSending(false);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantContent = "";

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (!done) {
          const { value, done: streamDone } = await reader?.read()!;
          done = streamDone;
          if (value) {
            let chunk = decoder.decode(value, { stream: true });
            const payloads = chunk.toString().split('\n\n');

            for (const payload of payloads) {
              if (payload.startsWith('data:')) {
                const data = payload.replace('data: ', '');
                assistantContent += data.replaceAll('\\n', '\n');
                const html = await convertMarkdown(assistantContent);

                setMessages(prevMessages => {
                  const updatedMessages = [...prevMessages];
                  const lastMessageIndex = updatedMessages.length - 1;
                  if (lastMessageIndex >= 0) {
                    updatedMessages[lastMessageIndex] = { role: 'assistant', content: html };
                  }
                  return updatedMessages;
                });
              }
            }
          }
        }
      } else {
        toast('An error occurred while sending message', {
          description: 'You have reached the maximum allowed limit of 20 messages per session.'
        })
      }
      setIsGenerating(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setUserMessage(textarea.value);
  
    textarea.style.height = 'auto';
  
    const minHeight = '2.5rem';
    const maxHeight = '300px';
  
    if (!textarea.value) {
      textarea.style.height = minHeight;
    } else {
      const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
      textarea.style.height = `${newHeight-24}px`;
    }
  };  

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100)
  }, [messages]);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchChatMessages();
  }, [selectedPlan]);


  const renderMessages = () => messages.map((message, index) => (
    <div key={index} className={`flex w-full px-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-2xl py-2 px-4 ${message.role === 'user' ? `bg-border max-w-[70%] ${index === messages.length-1 && isSending && 'opacity-30'}` : 'bg-background border border-border max-w-[95%] overflow-x-auto lg:max-w-[70%]'}`}>
        {message.role === 'assistant' 
          ? <div dangerouslySetInnerHTML={{ __html: message.content }} /> 
          : message.content}
      </div>
    </div>
  ));

  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <main className={`h-[calc(100%-32rem)] flex-grow flex ${isLoading && 'items-center justify-center'}`}>
        {isLoading ? (
          <SquareLoader size={35} speedMultiplier={0.8} />
        ) : (
          <Container className='flex flex-col w-full mt-20 lg:mt-28 px-0'>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="flex cursor-pointer items-center w-fit px-6 lg:px-10 xl:px-4 pb-3 lg:pb-6">
                    <Title size='sm' text={selectedPlan ? planOptions.find(opt => opt.value === selectedPlan)?.label ?? 'Select session...' : 'Select session...'} className={`font-bold ${!selectedPlan && 'opacity-50'}`} />
                    <ChevronDown className={`ml-3 h-4 w-4 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search session..." />
                    <CommandList>
                      <CommandEmpty>No session found.</CommandEmpty>
                      <CommandGroup>
                        {planOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            keywords={[option.label]}
                            onSelect={() => {
                              setSelectedPlan(option.value === selectedPlan ? "" : option.value)
                              setOpen(false)
                            }}
                          >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPlan === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedPlan && (
                <>
                  <ScrollArea className="flex-1 max-h-full">
                    <div className="relative space-y-7 xl:pr-5 w-screen xl:w-full">
                      {messages.length === 0 ? (
                        <p className="absolute top-1/2 opacity-50 text-lg w-full text-center">No messages yet.</p>
                      ) : (
                        <>
                          {renderMessages()}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="bg-background px-2 xl:px-0">
                    <div className="flex justify-center items-center px-3 py-1 mb-6 lg:mb-0 border border-input rounded-[26px] h-fit gap-2">
                      <textarea 
                        placeholder="Ask a question.." 
                        className="h-10 max-h-40 p-2 text-base resize-none flex-1 outline-none disabled:bg-background disabled:opacity-30" 
                        value={userMessage} 
                        onChange={handleInputChange}
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            sendMessage();
                          }
                        }}
                      />
                      <button className={`flex justify-center items-center transform w-9 h-9 bg-foreground text-background rounded-full transition ${userMessage.trim().length === 0 ? 'opacity-20 cursor-default' : 'cursor-pointer hover:bg-muted-foreground'}`} onClick={sendMessage}>
                        <ArrowUp width={18} height={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
          </Container>
        )}
      </main>
      <Footer className="hidden lg:block mt-10" />
    </div>
  );
}
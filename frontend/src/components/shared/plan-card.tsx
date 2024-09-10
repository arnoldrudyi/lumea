'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Ellipsis, Trash2, ExternalLink } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { apiRequest } from '@/lib/apiClient';
import { Plan } from '@/types';

interface Props {
   className?: string;
   id: string;
   chatId: string;
   title: string;
   subtopicsCount: number;
   hours: number;
   setPlans: Dispatch<SetStateAction<Plan[]>>;
   isLargeScreen: boolean;
}

export const PlanCard: React.FC<Props> = ({ className, id, chatId, title, subtopicsCount, hours, setPlans, isLargeScreen }) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();
  
  const deleteChat = async (chatId: string) => {
    setIsDeleting(true);

    const response = await apiRequest('delete', `/chats/${chatId}/`, true);
    if (response && response.status === 'ok') {
      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.chat_session !== chatId)
      );
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {isLargeScreen ? (
        <div id={id} className={cn('group flex justify-between rounded-lg border-border shadow-md border w-80 h-20 py-3 px-4 cursor-pointer transition-transform duration-300 hover:-translate-y-1', className)}>
          <div>
            <p className='text-xl w-full text-ellipsis whitespace-nowrap overflow-hidden'>{title}</p>
            <p className='text-muted-foreground'>{hours} hours | {subtopicsCount} subtopics</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className='opacity-0 group-hover:opacity-100 transition-opacity'/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DialogTrigger className='w-full'>
                <DropdownMenuItem className='text-input-error gap-x-3'>
                  <Trash2 width={20} height={20} />
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div id={id} className={cn('group rounded-lg border-border shadow-md border w-80 h-20 py-3 px-4', className)}>
              <div>
                <p className='text-xl w-full text-ellipsis whitespace-nowrap overflow-hidden'>{title}</p>
                <p className='text-muted-foreground'>{hours} hours | {subtopicsCount} subtopics</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-80'>
            <DropdownMenuItem className='flex justify-center items-center gap-x-3 xl:hidden text-base' onClick={() => router.push(`/plans/${id}`)}>
              <ExternalLink width={20} height={20} />
              Open
            </DropdownMenuItem>
            <DialogTrigger className='w-full'>
              <DropdownMenuItem className='flex justify-center items-center text-input-error gap-x-3 text-base'>
                <Trash2 width={20} height={20} />
                Delete
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DialogContent className='max-w-[350px] md:max-w-lg' showCloseButton={false}>
        <DialogHeader className='space-y-3'>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete <span className='font-bold'>{title}</span> session and remove its data from our server.
          </DialogDescription>
        </DialogHeader>
        <Button variant='destructive' disabled={isDeleting} onClick={() => deleteChat(chatId)}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
      </DialogContent>
    </Dialog>
  );
};
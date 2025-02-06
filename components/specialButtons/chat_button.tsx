'use client';

import { Stars } from 'lucide-react';
import React from 'react';
import { useChatContext } from '@/contexts/chat_window_context';
import { cn } from '@/lib/utils';

import { aiButtonClass } from './ai_button';

const ChatButton: React.FC = ({ isMobile }: { isMobile?: boolean }) => {
  const { setChatOpen } = useChatContext();

  return (
    <button
      className={cn(
        'z-40 md:flex md:gap-2 p-4 md:p-3 md:h-fit w-14 md:w-fit rounded-full md:rounded-md font-semibold items-center justify-center',
        aiButtonClass
      )}
      onClick={() => setChatOpen(true)}
    >
      <Stars /> <span className="hidden md:flex">Chat</span>
    </button>
  );
};

export default ChatButton;

export const DesktopChatButton: React.FC = () => {
  return (
    <div className="z-40 hidden md:fixed bottom-4 max-w-prose right-4 md:flex flex-col bg-transparent ">
      <div className="flex justify-end">
        <ChatButton />
      </div>
    </div>
  );
};

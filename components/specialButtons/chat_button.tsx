'use client';

import { Stars } from 'lucide-react';
import React from 'react';
import { useChatContext } from '@/contexts/chat_window_context';

const ChatButton: React.FC = ({ isMobile }: { isMobile?: boolean }) => {
  const { setChatOpen } = useChatContext();

  return (
    <button
      className="z-40 flex gap-2 bg-gradient-to-r p-3 md:h-fit h-14 w-14 md:w-fit rounded-full md:rounded-md from-blue-600 to-cyan-600 text-white font-semibold items-center justify-center"
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

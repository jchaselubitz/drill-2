'use client';

import { Stars } from 'lucide-react';
import React from 'react';
import { useChatContext } from '@/contexts/chat_window_context';

const ChatButton: React.FC = ({ isMobile }: { isMobile?: boolean }) => {
  const { setChatOpen } = useChatContext();

  return (
    <button
      className="flex gap-2 bg-gradient-to-r p-3 md:h-fit h-14 w-14 rounded-full md:rounded-md from-blue-600 to-cyan-600 text-white font-semibold items-center justify-center"
      onClick={() => setChatOpen(true)}
    >
      <Stars /> <div className="hidden md:flex">Chat</div>
    </button>
  );
};

export default ChatButton;

export const DesktopChatButton: React.FC = () => {
  return (
    <div className="hidden md:fixed bottom-4 max-w-prose right-4 md:flex flex-col ">
      <div className="flex justify-end">
        <ChatButton />
      </div>
    </div>
  );
};

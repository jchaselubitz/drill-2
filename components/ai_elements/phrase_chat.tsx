import { Loader2, Minus, Send, Stars, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

// const messages = [
//   {
//     role: 'assistant',
//     content:
//       "In the provided text, 'Darbietung' refers to a performance or presentation, particularly in the context of dance. It signifies the act of showcasing the dancers' skills and artistry. The term conveys a sense of admiration and respect for the quality of the performance, suggesting that it captivated and impressed the audience deeply.",
//   },
//   {
//     role: 'user',
//     content: 'What is another word I could use that means something similar?',
//   },
//   {
//     role: 'assistant',
//     content:
//       "Another word you could use that means something similar to 'Darbietung' is 'Vorführung.' This also refers to a performance or demonstration, particularly in an artistic context.",
//   },
//   {
//     role: 'user',
//     content: 'What is another word I could use that means something similar?',
//   },
//   {
//     role: 'assistant',
//     content:
//       "In the provided text, 'Darbietung' refers to a performance or presentation, particularly in the context of dance. It signifies the act of showcasing the dancers' skills and artistry. The term conveys a sense of admiration and respect for the quality of the performance, suggesting that it captivated and impressed the audience deeply.",
//   },
//   {
//     role: 'user',
//     content: 'What is another word I could use that means something similar?',
//   },
//   {
//     role: 'assistant',
//     content:
//       "Another word you could use that means something similar to 'Darbietung' is 'Vorführung.' This also refers to a performance or demonstration, particularly in an artistic context.",
//   },
//   {
//     role: 'user',
//     content: 'What is another word I could use that means something similar?',
//   },
// ];

export interface ChatMessage {
  role: string;
  content: string;
  requestText?: string;
}

interface PhraseChatProps {
  messages: ChatMessage[];
  requestText?: string;
  handleRequest: (request: string) => void;
  endSession?: () => void;
  requestLoading?: boolean;
}

const PhraseChat: React.FC<PhraseChatProps> = ({
  messages,
  requestText,
  handleRequest,
  endSession,
  requestLoading,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    handleRequest(newMessage);
    setNewMessage('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 max-w-prose right-4 flex flex-col bg-slate-200 p-3 rounded-md ">
        <div className="flex justify-end ">
          <button onClick={() => setIsOpen(true)}>Open Chat</button>
        </div>
      </div>
    );
  }

  const assistantButton = (
    <div className="absolute flex justify-end right-0 m-3">
      <span className="flex gap-2 items-start rounded-lg p-3 text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
        <div className="animate-pulse mr-1">
          <Stars />
        </div>
        {requestText}
        <button onClick={endSession}>
          <XIcon size={20} />
        </button>
      </span>
    </div>
  );

  return (
    <div className="fixed z-50 bottom-0 right-0 md:right-4 flex flex-col  md:min-h-96 md:max-h-[700px] rounded-lg border bg-white shadow-inner h-full">
      <div className="flex justify-end bg-slate-100 p-1 px-4">
        <button onClick={() => setIsOpen(false)}>
          <Minus size={20} />
        </button>
      </div>
      <div className="flex flex-col h-full relative ">
        {assistantButton}
        <div className="pt-14 md:pb-14 pb-20 overflow-y-scroll px-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex my-4', {
                'justify-start': message.role === 'assistant',
                'justify-end': message.role !== 'assistant',
              })}
            >
              <div
                className={cn('max-w-prose p-3 rounded-lg text-gray-800', {
                  'bg-blue-200': message.role === 'assistant',
                  'bg-slate-200': message.role !== 'assistant',
                })}
              >
                {message.content}
              </div>
            </div>
          ))}
          {requestLoading && (
            <div
              className={cn(
                'flex my-4 justify-start bg-blue-200 w-fit p-3 rounded-lg text-gray-800'
              )}
            >
              <Loader2 size={24} className="animate-spin" />
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-full bg-zinc-100 py-3 shadow-smallAbove">
        <form className="flex gap-2 px-4 ">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="py-2"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            onKeyDown={(e) => handleKeyPress(e)}
          >
            <Send size={24} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PhraseChat;

'use client';
import { Loader2, Minus, Send, Stars, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { useChatContext } from '@/contexts/chat_window_context';
import { addHistory } from '@/lib/actions/actionsHistory';
import {
  generateHistory,
  getModelSelection,
  getOpenAiKey,
  gptFormatType,
} from '@/lib/helpers/helpersAI';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

export interface ChatMessage {
  role: string;
  content: string;
  requestText?: string;
}

const PhraseChat: React.FC = () => {
  const supabase = createClient();
  const {
    chatOpen,
    setChatOpen,
    messages,
    setMessages,
    chatContext,
    setChatContext,
    onEndSession,
    chatLoading,
    setChatLoading,
  } = useChatContext();

  const requestText = chatContext?.requestText;
  const [newMessage, setNewMessage] = useState<string>('');

  const modelParams = {
    format: 'text' as gptFormatType,
    max_tokens: 1000,
    temperature: 0.9,
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleEndChat = async () => {
    setChatOpen(false);
    if (!messages) return;
    try {
      const { topic, lang, insight } = await generateHistory(messages);
      await addHistory({
        topic,
        lang,
        insight,
      });
    } catch (error) {
      console.error('Error adding history:', error);
    }
    onEndSession && onEndSession();
    setChatContext(undefined);
    setMessages([]);
  };

  const handleSend = async () => {
    setChatLoading(true);

    const messagePackage = [
      ...(messages ?? []),
      newMessage && { role: 'user', content: newMessage },
    ] as ChatMessage[];

    const { data, error } = await supabase.functions.invoke('gen-chat', {
      body: {
        userApiKey: getOpenAiKey(),
        modelSelection: getModelSelection(),
        modelParams: modelParams,
        messages: messagePackage,
      },
    });
    try {
      setMessages([...messagePackage, { role: data.role, content: data.content }]);
      setChatLoading(false);
    } catch (error) {
      alert('Sorry, something went wrong. Please try again.');
      setChatLoading(false);
      throw Error('Error parsing JSON:', data);
    }
    setChatLoading(false);
    setNewMessage('');
  };

  const presentableMessages = messages?.filter(
    (message) => message.role !== 'system' && message.content !== ''
  );

  if (!chatOpen) {
    return (
      <div className="fixed bottom-4 max-w-prose right-4 flex flex-col bg-slate-200 p-3 rounded-md ">
        <div className="flex justify-end ">
          <button onClick={() => setChatOpen(true)}>Open Chat</button>
        </div>
      </div>
    );
  }

  const chatTopBar = (
    <div className="flex justify-between bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-1 px-4 rounded-t ">
      <div className="flex justify-start gap-2 items-center">
        <div className="animate-pulse mr-1">
          <Stars />
        </div>
        {requestText}
      </div>

      <div className="flex justify-end gap-2 items-center w-fit">
        <button onClick={() => setChatOpen(false)}>
          <Minus size={20} />
        </button>
        <button onClick={async () => handleEndChat()}>
          <XIcon size={20} />
        </button>
      </div>
    </div>
  );

  const chatLoadingIndicator = (
    <div className={cn('flex my-4 justify-start bg-blue-200 w-fit p-3 rounded-lg text-gray-800')}>
      <Loader2 size={24} className="animate-spin" />
    </div>
  );

  return (
    <div className="fixed z-50 bottom-0 right-0 md:right-4 flex flex-col md:min-h-96 max-h-dvh md:max-h-[700px] rounded-lg border bg-white shadow-inner h-full md:min-w-96">
      {chatTopBar}
      <div className="flex flex-col h-full relative ">
        <ScrollArea className=" pb-24 overflow-y-scroll px-4">
          {presentableMessages?.map((message, index) => (
            <div
              key={index}
              className={cn('flex my-4', {
                'justify-start': message.role === 'assistant',
                'justify-end': message.role !== 'assistant',
              })}
            >
              <Markdown
                className={cn('max-w-prose p-3 rounded-lg text-gray-800', {
                  'bg-blue-200': message.role === 'assistant',
                  'bg-slate-200': message.role !== 'assistant',
                })}
              >
                {message.content}
              </Markdown>
            </div>
          ))}
          {chatLoading && chatLoadingIndicator}
        </ScrollArea>
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

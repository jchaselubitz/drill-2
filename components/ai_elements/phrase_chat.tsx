'use client';
import { ChevronDown, Languages, Loader2, Minus, Send, Stars, XIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { useChatContext } from '@/contexts/chat_window_context';
import { useUserContext } from '@/contexts/user_context';
import { getModelSelection, getOpenAiKey, gptFormatType } from '@/lib/helpers/helpersAI';
import { processHistory } from '@/lib/helpers/helpersHistory';
import { Languages as LanguagesList } from '@/lib/lists';
import { getLangIcon, getLangName } from '@/lib/lists';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';

export interface ChatMessage {
  role: string;
  content: string;
  requestText?: string;
}

const PhraseChat: React.FC = () => {
  const supabase = createClient();
  const { prefLanguage, history } = useUserContext();

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
    currentLang,
    setCurrentLang,
  } = useChatContext();

  const learningLang = currentLang ?? prefLanguage;
  const existingHistory = history?.find((h) => h.lang === learningLang);

  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [newMessage, setNewMessage] = useState<string>('');
  const requestText = chatContext?.requestText;
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const presentableMessages = useMemo(
    () => messages?.filter((message) => message.role !== 'system' && message.content !== ''),
    [messages]
  );

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const modelParams = {
    format: { type: 'text' } as gptFormatType,
    max_tokens: 400,
    temperature: 0.9,
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend();
    }
  };

  const handleEndChat = async () => {
    setChatOpen(false);
    if (!messages) return;
    if (!learningLang) return;
    try {
      await processHistory({ messages, existingHistory, learningLang });
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
    setMessages(messagePackage);
    setNewMessage('');
    const { data, error } = await supabase.functions.invoke('gen-text', {
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

  if (!chatOpen) return null;

  const langSetting = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          {learningLang ? getLangIcon(learningLang) : <Languages size={18} />}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {LanguagesList.map((l) => {
          return (
            <DropdownMenuCheckboxItem
              key={l.value}
              className="capitalize flex items-center gap-2 justify-between"
              checked={learningLang === l.value}
              onCheckedChange={(v) => setCurrentLang(l.value)}
            >
              {getLangIcon(l.value)} {getLangName(l.value)}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const chatTopBar = (
    <div className="flex justify-between bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-1 px-2 rounded-t">
      <div className="flex justify-start gap-2 items-center">
        <div className="animate-pulse mr-1">
          <Stars />
        </div>
        {requestText}
      </div>

      <div className="flex justify-end gap-2 items-center w-fit">
        <button
          onClick={() => setChatOpen(false)}
          className="flex gap-1 items-center border px-1 rounded-sm"
        >
          <div className="text-xs">Hide</div>
          <Minus size={20} />
        </button>
        <button
          onClick={async () => handleEndChat()}
          className="flex gap-1 items-center border px-1 rounded-sm"
        >
          <div className="text-xs">End</div>
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
    <div
      className="fixed z-50 bottom-0 right-0 md:right-4 flex flex-col rounded-lg border border-zinc-300 bg-white  bg-opacity-65 shadow-inner h-dvh md:min-h-96 md:h-[900px] md:max-h-svh w-full md:w-[500px]"
      onWheel={handleMouseEvent}
      onMouseMove={handleMouseEvent}
      onClick={handleMouseEvent}
    >
      {chatTopBar}
      <div className="flex h-full flex-col relative backdrop-blur-lg	">
        <div className="pb-24 w-full overflow-y-scroll px-4" ref={scrollRef}>
          {presentableMessages?.map((message, index) => (
            <div
              key={index}
              className={cn('flex my-4 w-full', {
                'justify-start': message.role === 'assistant',
                'justify-end': message.role !== 'assistant',
              })}
            >
              <div
                className={cn('max-w-full p-3 rounded-lg text-gray-800', {
                  'bg-blue-200 mr-8': message.role === 'assistant',
                  'bg-slate-200 ml-8': message.role !== 'assistant',
                })}
              >
                <Markdown className="max-w-full prose">{message.content}</Markdown>
              </div>
            </div>
          ))}
          {chatLoading && chatLoadingIndicator}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-full bg-zinc-100 py-3 shadow-smallAbove">
        <form className="flex gap-2 px-4 ">
          {newMessage === '' && langSetting}
          <Textarea
            ref={inputRef}
            rows={newMessage === '' ? 1 : 3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
            placeholder={`Ask me about ${getLangName(learningLang)}`}
            className="min-h-10"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <Button
              className="p-3  rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              disabled={newMessage === '' || chatLoading}
              onClick={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Send size={24} />
            </Button>
            {newMessage !== '' && getLangIcon(learningLang)}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhraseChat;

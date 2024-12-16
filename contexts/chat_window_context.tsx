'use client';

import { BaseHistory } from 'kysely-codegen';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ChatMessage } from '@/components/ai_elements/phrase_chat';

type ChatContextType =
  | {
      matterText?: string | null;
      requestText?: string;
      assistantAnswer?: string;
      systemMessage?: string;
      setSystemMessage?: (message: string) => void;
    }
  | undefined;

type ChatWindowType = {
  chatLoading: boolean;
  setChatLoading: (loading: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: ChatMessage[] | null;
  setMessages: (messages: ChatMessage[]) => void;
  chatContext: ChatContextType;
  setChatContext: (context: ChatContextType) => void;
  onEndSession?: () => void;
  setOnEndSession?: (endSession: () => void) => void;
};

const ChatWindow = createContext<ChatWindowType | undefined>(undefined);

export const ChatWindowProvider = ({
  children,
  userHistory,
}: {
  children: ReactNode;
  userHistory?: BaseHistory[];
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContextType | undefined>(undefined);
  const [chatMessages, setChatMessages] = useState<ChatMessage[] | null>([]);
  const [onEndSession, setOnEndSession] = useState<() => void>(() => () => {});
  const [chatLoading, setChatLoading] = useState(false);

  //do I want to add a base system message here?

  useEffect(() => {
    if (!chatContext) {
      return;
    }
    setChatMessages((prevState) => {
      const existingMessages = prevState ?? [];
      let newBatch = [];
      if (chatContext.systemMessage) {
        newBatch.push({ role: 'system', content: chatContext.systemMessage });
      }
      if (chatContext.matterText) {
        newBatch.push({ role: 'user', content: chatContext.matterText });
      }
      if (chatContext.assistantAnswer) {
        newBatch.push({ role: 'assistant', content: chatContext.assistantAnswer });
      }
      if (chatContext) {
        return [...existingMessages, ...newBatch];
      }
      return existingMessages;
    });
  }, [chatContext, setChatMessages, chatContext?.assistantAnswer]);

  const endSession = () => {
    setChatOpen(false);
    setChatMessages([]);
    onEndSession();
  };

  return (
    <ChatWindow.Provider
      value={{
        chatLoading,
        setChatLoading,
        chatOpen,
        setChatOpen,
        messages: chatMessages,
        setMessages: setChatMessages,
        chatContext,
        setChatContext,
        setOnEndSession: setOnEndSession,
        onEndSession: endSession,
      }}
    >
      {children}
    </ChatWindow.Provider>
  );
};

export const useChatContext = (): ChatWindowType => {
  const context = useContext(ChatWindow);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a UserProvider');
  }
  return context;
};

// Should be able to take in
// -- chat title
// --
// -- user history
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

'use client';

import { BaseHistory } from 'kysely-codegen';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
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
  setOnEndSession: (endSession: () => void) => void;
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

  const createNewMessageBatch = useMemo(() => {
    const batch = [];
    if (chatContext?.systemMessage) {
      batch.push({ role: 'system', content: chatContext.systemMessage });
    }
    if (chatContext?.matterText) {
      batch.push({ role: 'user', content: chatContext.matterText });
    }
    if (chatContext?.assistantAnswer) {
      batch.push({ role: 'assistant', content: chatContext.assistantAnswer });
    }
    return batch;
  }, [chatContext]);

  useEffect(() => {
    if (!chatContext) {
      return;
    }

    setChatMessages((prevState) => {
      const existingMessages = prevState ?? [];
      return [...existingMessages, ...createNewMessageBatch];
    });
  }, [chatContext, setChatMessages, createNewMessageBatch]);

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
const messages = [
  {
    role: 'assistant',
    content:
      "In the provided text, 'Darbietung' refers to a performance or presentation, particularly in the context of dance. It signifies the act of showcasing the dancers' skills and artistry. The term conveys a sense of admiration and respect for the quality of the performance, suggesting that it captivated and impressed the audience deeply.",
  },
  {
    role: 'user',
    content: 'Whaatttt?',
  },
  {
    role: 'assistant',
    content:
      "Another word you could use that means something similar to 'Darbietung' is 'Vorführung.' This also refers to a performance or demonstration, particularly in an artistic context.",
  },
  {
    role: 'user',
    content: 'What is another word I could use that means something similar?',
  },
  {
    role: 'assistant',
    content: `Sure! Here’s a silly piece of Markdown for you:

# 🦄 Welcome to the Silly Kingdom! 🏰

## 🌈 The Rules of Goofiness:

1. **Always wear mismatched socks!** 🧦
   - They must include at least **one polka dot** and **one stripe**.
2. **Speak in rhymes** whenever possible! 🎤
   - If you don't, you might just turn into a **giant banana**! 🍌

## 🐉 Legendary Creatures of the Kingdom:

### 1. The Giggle Dragon 🐉
   - Breathes **sparkles** instead of fire.
   - Loves to play **hide and seek** with rainbows. 🌈

### 2. The Dancing Unicorn 🦄
   - Only dances when it hears **silly songs**. 🎶
   - Favorite dance move: the **Twirl of Joy**! 💃

## 🎉 Silly Celebrations:

- **The Annual Pie-in-the-Face Festival**! 🥧
  - Join us as we throw pies at our **friendly neighborhood clowns**! 🤡
  
- **Wacky Hat Day** 🎩
  - Wear your most ridiculous hat! The **winner gets a lifetime supply of jellybeans**! 🍬

## 💫 Join Us!

If you’re ready for some silliness, grab your **silliest pair of sunglasses** 😎, and let’s get this party started! 🎊

**P.S.** Don’t forget to bring your **pet rock**! 🪨 
Feel free to use or modify it as you wish!`,
  },
  {
    role: 'user',
    content: 'What is another word I could use that means something similar?',
  },
  {
    role: 'assistant',
    content:
      "Another word you could use that means something similar to 'Darbietung' is 'Vorführung.' This also refers to a performance or demonstration, particularly in an artistic context.",
  },
  {
    role: 'user',
    content: 'What is another word I could use that means something similar?',
  },
];

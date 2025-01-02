'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ChatMessage } from '@/lib/aiGenerators/types_generation';
import { getLangName, LanguagesISO639 } from '@/lib/lists';

import { useUserContext } from './user_context';

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
  currentLang: LanguagesISO639;
  setCurrentLang: (lang: LanguagesISO639) => void;
  onEndSession?: () => void;
  setOnEndSession: (endSession: () => void) => void;
};

const ChatWindow = createContext<ChatWindowType | undefined>(undefined);

export const ChatWindowProvider = ({ children }: { children: ReactNode }) => {
  const { prefLanguage } = useUserContext();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContextType | undefined>(undefined);
  const [currentLang, setCurrentLang] = useState<LanguagesISO639>(
    prefLanguage ?? LanguagesISO639.German
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[] | null>([]);
  const [onEndSession, setOnEndSession] = useState<() => void>(() => () => {});
  const [chatLoading, setChatLoading] = useState(false);

  const createNewMessageBatch = useMemo(() => {
    const batch = [];
    if (chatContext?.matterText) {
      batch.push({ role: 'user', content: chatContext.matterText });
    }
    if (chatContext?.requestText) {
      batch.push({ role: 'user', content: chatContext.requestText });
    }
    if (chatContext?.assistantAnswer) {
      batch.push({ role: 'assistant', content: chatContext.assistantAnswer });
    }
    return batch;
  }, [chatContext]);

  const baseSystemMessage = useCallback((addendum?: string) => {
    return {
      role: 'system',
      content: `Return a JSON. The content of every response should include include two key/value pairs: {type: "message" | "translation" | "list" , data: <contentData>}. The software consuming your response will use the type to determine how to present the data. 
  
  In most cases, the type should be "message". In this case, the contentData should be a string. 
  
  If the user asks for a translation, the type should be "translation" and the contentData should include {"input_text": <text the user is asking you to translate>,  "input_lang": <the ISO 639-1 code of the representing the language of the input_text>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation>}.,

  If the best answer to the user's request is list of values, the type should be "list", and the content contentData should be a list of either strings, or nested objects containing strings. If a value is an object, the front-end component calls itself again with that object in a nested fashion until it reaches a string. If the value is a string, the component will present it to the user as a string. the goal is to organize the data based on the user's request. examples: { "content": ['phrase1', 'phrase2', phrase3'] } OR 
  , {"content": { 'verbs': ['phrase1', 'phrase2', phrase3'], 'adjectives': ['phrase4', 'phrase5', phrase6'], 'nouns': ['phrase7', 'phrase8', phrase9'] }}. 

  ${addendum ?? ''}`,
    };
  }, []);

  useEffect(() => {
    if (!chatContext) {
      return;
    }

    setChatMessages((prevState) => {
      const existingMessages = prevState ?? [];
      const filteredSystemMessages = existingMessages.filter(
        (message) => message.role !== 'system'
      );
      return [
        baseSystemMessage(chatContext?.systemMessage),
        ...filteredSystemMessages,
        ...createNewMessageBatch,
      ];
    });
  }, [chatContext, setChatMessages, createNewMessageBatch, baseSystemMessage]);

  useEffect(() => {
    if (!currentLang) {
      return;
    }
    const langChatPrimer = {
      role: 'system',
      content: `Questions about ${getLangName(currentLang)}`,
    };

    setChatMessages((prevState) => {
      const existingMessages = prevState ?? [];
      const filteredSystemMessages = existingMessages.filter(
        (message) => message.role !== 'system'
      );
      return [baseSystemMessage(), ...filteredSystemMessages, langChatPrimer];
    });
  }, [setChatMessages, currentLang, baseSystemMessage]);

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
        currentLang,
        setCurrentLang,
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

// const messages = [
//   {
//     role: 'assistant',
//     content:
//       "In the provided text, 'Darbietung' refers to a performance or presentation, particularly in the context of dance. It signifies the act of showcasing the dancers' skills and artistry. The term conveys a sense of admiration and respect for the quality of the performance, suggesting that it captivated and impressed the audience deeply.",
//   },
//   {
//     role: 'user',
//     content: 'Whaatttt?',
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
//     content: `Sure! Here’s a silly piece of Markdown for you:

// # 🦄 Welcome to the Silly Kingdom! 🏰

// ## 🌈 The Rules of Goofiness:

// 1. **Always wear mismatched socks!** 🧦
//    - They must include at least **one polka dot** and **one stripe**.
// 2. **Speak in rhymes** whenever possible! 🎤
//    - If you don't, you might just turn into a **giant banana**! 🍌

// ## 🐉 Legendary Creatures of the Kingdom:

// ### 1. The Giggle Dragon 🐉
//    - Breathes **sparkles** instead of fire.
//    - Loves to play **hide and seek** with rainbows. 🌈

// ### 2. The Dancing Unicorn 🦄
//    - Only dances when it hears **silly songs**. 🎶
//    - Favorite dance move: the **Twirl of Joy**! 💃

// ## 🎉 Silly Celebrations:

// - **The Annual Pie-in-the-Face Festival**! 🥧
//   - Join us as we throw pies at our **friendly neighborhood clowns**! 🤡

// - **Wacky Hat Day** 🎩
//   - Wear your most ridiculous hat! The **winner gets a lifetime supply of jellybeans**! 🍬

// ## 💫 Join Us!

// If you’re ready for some silliness, grab your **silliest pair of sunglasses** 😎, and let’s get this party started! 🎊

// **P.S.** Don’t forget to bring your **pet rock**! 🪨
// Feel free to use or modify it as you wish!`,
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

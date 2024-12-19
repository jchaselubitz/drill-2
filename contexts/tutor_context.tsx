'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useSearchParam } from 'react-use';

interface TutorContextProps {
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;
}

const TutorContext = createContext<TutorContextProps | undefined>(undefined);

export const TutorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParam('tutor');
  const { openTopic } = searchParams ? { openTopic: searchParams } : { openTopic: null };
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(openTopic ?? null);

  const router = useRouter();

  const setSelectedTopic = (id: string | null) => {};

  return (
    <TutorContext.Provider
      value={{
        selectedTopicId,
        setSelectedTopicId: setSelectedTopic,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
};

export const useTutorContext = (): TutorContextProps => {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error('useTutorContext must be used within a TutorProvider');
  }
  return context;
};

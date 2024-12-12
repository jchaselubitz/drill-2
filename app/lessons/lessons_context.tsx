'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useSearchParam } from 'react-use';

interface LessonsContextProps {
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
}

const LessonsContext = createContext<LessonsContextProps | undefined>(undefined);

export const LessonsContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParam('subject');
  const { openSubject } = searchParams ? { openSubject: searchParams } : { openSubject: null };
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(openSubject ?? null);

  const router = useRouter();

  const setSelectedSubject = (id: string | null) => {
    setSelectedSubjectId(id);
    if (id === null) {
      router.push('/subjects');
    } else router.push(`?subject=${id}&`);
  };

  return (
    <LessonsContext.Provider
      value={{
        selectedSubjectId,
        setSelectedSubjectId: setSelectedSubject,
      }}
    >
      {children}
    </LessonsContext.Provider>
  );
};

export const useLessonsContext = (): LessonsContextProps => {
  const context = useContext(LessonsContext);
  if (!context) {
    throw new Error('useLessonsContext must be used within a LessonsProvider');
  }
  return context;
};

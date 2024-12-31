'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface LessonsContextProps {
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
}

const LessonsContext = createContext<LessonsContextProps | undefined>(undefined);

export const LessonsContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParams();
  const openSubject = searchParams.get('subject');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(openSubject ?? null);

  useEffect(() => {
    if (openSubject !== selectedSubjectId) {
      setSelectedSubjectId(openSubject);
    }
  }, [openSubject, selectedSubjectId]);

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

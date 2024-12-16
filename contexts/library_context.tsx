'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useSearchParam } from 'react-use';

interface LibraryContextProps {
  selectedPhraseId: string | null;
  setSelectedPhraseId: (id: string | null) => void;
}

const LibraryContext = createContext<LibraryContextProps | undefined>(undefined);

export const LibraryContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParam('lesson');
  const { phrase } = searchParams ? { phrase: searchParams } : { phrase: null };
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(phrase);

  const router = useRouter();

  const setSelected = (id: string | null) => {
    setSelectedPhraseId(id);
    if (id === null) {
      router.push('/library');
    } else router.push(`?phrase=${id}`);
  };

  return (
    <LibraryContext.Provider value={{ selectedPhraseId, setSelectedPhraseId: setSelected }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibraryContext = (): LibraryContextProps => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibraryContext must be used within a LibraryProvider');
  }
  return context;
};

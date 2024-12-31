'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface LibraryContextProps {
  selectedPhraseId: string | null;
  setSelectedPhraseId: (id: string | null) => void;
}

const LibraryContext = createContext<LibraryContextProps | undefined>(undefined);

export const LibraryContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParams();
  const phraseId = searchParams.get('phrase');
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(phraseId);

  useEffect(() => {
    if (phraseId !== selectedPhraseId) {
      setSelectedPhraseId(phraseId);
    }
  }, [phraseId, selectedPhraseId]);

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

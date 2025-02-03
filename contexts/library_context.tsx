'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface LibraryContextProps {
  selectedPhraseId: string | null;
  selectedPage: number | undefined;
  setSelectedPhrasePage: ({ page, phraseId }: { page?: number; phraseId?: string | null }) => void;
}

const LibraryContext = createContext<LibraryContextProps | undefined>(undefined);

export const LibraryContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const searchParams = useSearchParams();
  const phraseId = searchParams.get('phrase');
  const pageId = searchParams.get('page');
  const page = pageId ? parseInt(pageId, 10) - 1 : 0;
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(phraseId);
  const [selectedPage, setSelectedPage] = useState<number | undefined>(page || 0);
  useEffect(() => {
    if (phraseId !== selectedPhraseId) {
      setSelectedPhraseId(phraseId);
    }
  }, [phraseId, selectedPhraseId]);

  const router = useRouter();

  const setSelectedPhrasePage = ({
    phraseId,
    page,
  }: {
    page?: number;
    phraseId?: string | null;
  }) => {
    phraseId && setSelectedPhraseId(phraseId);
    setSelectedPage(page);
    if (page && phraseId) {
      router.push(`/library${`?page=${page + 1}&phrase=${phraseId}`}`);
    } else if (phraseId) {
      router.push(`/library${`?phrase=${phraseId + 1}`}`);
    } else if (page) {
      router.push(`/library${`?page=${page + 1}`}`);
    } else router.push(`/library`);
  };

  return (
    <LibraryContext.Provider value={{ selectedPhraseId, selectedPage, setSelectedPhrasePage }}>
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

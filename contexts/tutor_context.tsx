'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface TutorContextProps {
  selectedPromptAndCorrection: {
    promptId: string | null;
    correctionId: string | null;
  };
  setSelectedPromptAndCorrection: React.Dispatch<
    React.SetStateAction<{
      promptId: string | null;
      correctionId: string | null;
    }>
  >;
}

const TutorContext = createContext<TutorContextProps | undefined>(undefined);

export const TutorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selectedPromptAndCorrection, setSelectedPromptAndCorrection] = useState<{
    promptId: string | null;
    correctionId: string | null;
  }>({ promptId: null, correctionId: null });

  return (
    <TutorContext.Provider
      value={{
        selectedPromptAndCorrection,
        setSelectedPromptAndCorrection: setSelectedPromptAndCorrection,
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

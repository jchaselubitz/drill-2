'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';
type CreateModalType = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

const CreateModal = createContext<CreateModalType | undefined>(undefined);

export const CreateModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <CreateModal.Provider
      value={{
        modalOpen,
        setModalOpen,
      }}
    >
      {children}
    </CreateModal.Provider>
  );
};

export const useCreateModal = (): CreateModalType => {
  const context = useContext(CreateModal);
  if (context === undefined) {
    throw new Error('useCreateModal must be used within a UserProvider');
  }
  return context;
};

'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { BaseProfile } from 'kysely-codegen';
import { LanguagesISO639 } from '@/lib/lists';

type UserContextType = {
  userId: string;
  userLanguage: LanguagesISO639 | undefined | null;
  prefLanguage: LanguagesISO639 | undefined | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({
  profile,
  children,
}: {
  profile: BaseProfile | undefined | null;
  children: ReactNode;
}) => {
  const [userProfile] = useState<BaseProfile | undefined | null>(profile);
  if (!userProfile) {
    return <> {children}</>;
  }

  return (
    <UserContext.Provider
      value={{
        userId: userProfile.id,
        userLanguage: userProfile.userLanguage as LanguagesISO639,
        prefLanguage: userProfile.prefLanguage as LanguagesISO639,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

'use client';
import { BaseHistory, BaseMedia, ProfileWithMedia } from 'kysely-codegen';
import React, { createContext, ReactNode, useContext } from 'react';
import { LanguagesISO639 } from '@/lib/lists';

type UserContextType = {
  userId: string;
  userLanguage: LanguagesISO639 | undefined | null;
  prefLanguage: LanguagesISO639 | undefined | null;
  imageUrl: string | undefined | null;
  username: string | undefined | null;
  media: BaseMedia[] | undefined | null;
  history: BaseHistory[] | undefined | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({
  profile,
  children,
  userHistory,
}: {
  profile: ProfileWithMedia | undefined | null;
  children: ReactNode;
  userHistory: BaseHistory[] | undefined | null;
}) => {
  if (!profile) {
    return <> {children}</>;
  }

  return (
    <UserContext.Provider
      value={{
        userId: profile.id,
        userLanguage: profile.userLanguage as LanguagesISO639,
        prefLanguage: profile.prefLanguage as LanguagesISO639,
        imageUrl: profile.imageUrl,
        username: profile.username,
        media: profile.media,
        history: userHistory,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

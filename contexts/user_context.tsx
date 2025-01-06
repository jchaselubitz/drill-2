'use client';
import { BaseHistory, BaseMedia, Iso639LanguageCode, ProfileWithMedia } from 'kysely-codegen';
import React, { createContext, ReactNode, useContext } from 'react';

type UserContextType = {
  userId: string;
  userLanguage: Iso639LanguageCode | undefined | null;
  prefLanguage: Iso639LanguageCode | undefined | null;
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
        userLanguage: profile.userLanguage as Iso639LanguageCode,
        prefLanguage: profile.prefLanguage as Iso639LanguageCode,
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

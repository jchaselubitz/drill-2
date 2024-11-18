'use client';
import { BaseMedia, Media, ProfileWithMedia } from 'kysely-codegen';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { LanguagesISO639 } from '@/lib/lists';

type UserContextType = {
  userId: string;
  userLanguage: LanguagesISO639 | undefined | null;
  prefLanguage: LanguagesISO639 | undefined | null;
  imageUrl: string | undefined | null;
  username: string | undefined | null;
  media: BaseMedia[] | undefined | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({
  profile,
  children,
}: {
  profile: ProfileWithMedia | undefined | null;
  children: ReactNode;
}) => {
  const [userProfile] = useState<ProfileWithMedia | undefined | null>(profile);
  if (!userProfile) {
    return <> {children}</>;
  }

  console.log({
    userId: userProfile.id,
    userLanguage: userProfile.userLanguage as LanguagesISO639,
    prefLanguage: userProfile.prefLanguage as LanguagesISO639,
    imageUrl: userProfile.imageUrl,
    username: userProfile.username,
    media: userProfile.media,
  });

  return (
    <UserContext.Provider
      value={{
        userId: userProfile.id,
        userLanguage: userProfile.userLanguage as LanguagesISO639,
        prefLanguage: userProfile.prefLanguage as LanguagesISO639,
        imageUrl: userProfile.imageUrl,
        username: userProfile.username,
        media: userProfile.media,
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

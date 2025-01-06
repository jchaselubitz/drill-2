'use client';

import { Iso639LanguageCode } from 'kysely-codegen';
import { BookA, Home } from 'lucide-react';
import React, { useEffect } from 'react';
import LanguageMenu from '@/app/(components)/language_selector';
import { useUserContext } from '@/contexts/user_context';
import { setUserLanguages } from '@/lib/helpers/helpersUser';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

const LanguageChoiceModal: React.FC = () => {
  const { userLanguage, prefLanguage } = useUserContext();
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    if (!userLanguage || !prefLanguage) {
      setIsOpen(true);
    }
  }, [userLanguage, prefLanguage]);

  const handleSetUserLanguages = ({ lang, name }: { lang: Iso639LanguageCode; name: string }) =>
    setUserLanguages({
      lang,
      name,
      prefLanguage: prefLanguage ?? null,
      userLanguage: userLanguage ?? null,
    });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
      }}
    >
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your languages</DialogTitle>
          <DialogDescription>
            Choose your native language and the language you are primarily interested in studying.
          </DialogDescription>
        </DialogHeader>

        <LanguageMenu
          props={{
            icon: Home,
            label: 'User Language',
            name: 'userLanguage',
            language: userLanguage,
          }}
          onClick={handleSetUserLanguages}
        />

        <LanguageMenu
          props={{
            icon: BookA,
            label: 'Study Language',
            name: 'prefLanguage',
            language: prefLanguage,
          }}
          onClick={handleSetUserLanguages}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LanguageChoiceModal;

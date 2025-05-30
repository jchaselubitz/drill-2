import { Iso639LanguageCode } from 'kysely-codegen';
import { BookA, Home, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import LanguageMenu from '@/components/selectors/language_selector';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { useUserContext } from '@/contexts/user_context';
import { setUserLanguages } from '@/lib/helpers/helpersUser';

const LanguageChooser: React.FC = () => {
  const { userLanguage, prefLanguage } = useUserContext();
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [loadingSecondary, setLoadingSecondary] = useState(false);

  const handleSetUserLanguages = async ({
    lang,
    name,
  }: {
    lang: Iso639LanguageCode;
    name: 'userLanguage' | 'prefLanguage' | string;
  }) => {
    if (name === 'userLanguage') {
      setLoadingPrimary(true);
    } else {
      setLoadingSecondary(true);
    }
    try {
      await setUserLanguages({
        lang,
        name,
        prefLanguage: prefLanguage ?? null,
        userLanguage: userLanguage ?? null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (name === 'userLanguage') {
        setLoadingPrimary(false);
      } else {
        setLoadingSecondary(false);
      }
    }
  };

  const loadingPlaceholder = (
    <div
      className={
        'border p-2 flex items-center gap-2 rounded-md focus:ring-0 focus:border-0 focus:ring-offset-0'
      }
    >
      <span className="text-sm  font-bold">
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>
      <span className="truncate text-sm  font-semibold">Loading...</span>
    </div>
  );

  return (
    <>
      <SidebarMenuItem>
        {loadingPrimary ? (
          loadingPlaceholder
        ) : (
          <LanguageMenu
            props={{
              icon: Home,
              label: 'User Language',
              name: 'userLanguage',
              language: userLanguage,
            }}
            onClick={handleSetUserLanguages}
          />
        )}
      </SidebarMenuItem>
      <SidebarMenuItem>
        {loadingSecondary ? (
          loadingPlaceholder
        ) : (
          <LanguageMenu
            props={{
              icon: BookA,
              label: 'Study Language',
              name: 'prefLanguage',
              language: prefLanguage,
            }}
            onClick={handleSetUserLanguages}
          />
        )}
      </SidebarMenuItem>
    </>
  );
};

export default LanguageChooser;

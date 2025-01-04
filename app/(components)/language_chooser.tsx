import { BookA, Home } from 'lucide-react';
import React from 'react';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { useUserContext } from '@/contexts/user_context';
import { setUserLanguages } from '@/lib/helpers/helpersUser';
import { LanguagesISO639 } from '@/lib/lists';

import LanguageMenu from './language_selector';

const LanguageChooser: React.FC = () => {
  const { userLanguage, prefLanguage } = useUserContext();

  const handleSetUserLanguages = ({ lang, name }: { lang: LanguagesISO639; name: string }) =>
    setUserLanguages({
      lang,
      name,
      prefLanguage: prefLanguage ?? null,
      userLanguage: userLanguage ?? null,
    });

  return (
    <>
      <SidebarMenuItem>
        <LanguageMenu
          props={{
            icon: Home,
            label: 'User Language',
            name: 'userLanguage',
            language: userLanguage,
          }}
          onClick={handleSetUserLanguages}
        />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <LanguageMenu
          props={{
            icon: BookA,
            label: 'Study Language',
            name: 'prefLanguage',
            language: prefLanguage,
          }}
          onClick={handleSetUserLanguages}
        />
      </SidebarMenuItem>
    </>
  );
};

export default LanguageChooser;

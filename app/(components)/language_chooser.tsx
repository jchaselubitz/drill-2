import { BookA, Home } from 'lucide-react';
import React from 'react';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { useUserContext } from '@/contexts/user_context';
import { LanguagesISO639 } from '@/lib/lists';

import LanguageMenu from './language_selector';

interface LanguageChooserProps {
  setUserLanguages: ({ lang, name }: { lang: LanguagesISO639; name: string }) => void;
}

const LanguageChooser: React.FC<LanguageChooserProps> = ({ setUserLanguages }) => {
  const { userLanguage, prefLanguage } = useUserContext();
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
          onClick={setUserLanguages}
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
          onClick={setUserLanguages}
        />
      </SidebarMenuItem>
    </>
  );
};

export default LanguageChooser;

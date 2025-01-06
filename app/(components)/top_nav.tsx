import { User } from '@supabase/supabase-js';
import { Iso639LanguageCode } from 'kysely-codegen';
import React from 'react';
import BackButton from '@/components/back_button';
import CreateButton from '@/components/specialButtons/create_button';
import { SidebarTrigger } from '@/components/ui/sidebar';

import UserMenu from './user-menu';

interface TopNavProps {
  isMobile: boolean;
  user?: User;
  setUserLanguages?: ({ lang, name }: { lang: Iso639LanguageCode; name: string }) => void;
}

const TopNav: React.FC<TopNavProps> = ({ isMobile, user, setUserLanguages }) => {
  return (
    <div className="fixed z-10 md:relative w-full flex items-center justify-between h-14 pr-4 bg-zinc-100 md:bg-transparent border-b border-slate-200 bg-opacity-80 ">
      <div className="flex items-center">
        {!isMobile && <SidebarTrigger />}
        <BackButton showLabel={!isMobile} />
      </div>
      {!isMobile ? (
        <CreateButton />
      ) : (
        <UserMenu user={user} setUserLanguages={setUserLanguages} mobile />
      )}
    </div>
  );
};

export default TopNav;

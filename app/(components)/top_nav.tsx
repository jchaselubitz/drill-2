import { User } from '@supabase/supabase-js';
import React from 'react';
import BackButton from '@/components/back_button';
import CreateButton from '@/components/specialButtons/create_button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LanguagesISO639 } from '@/lib/lists';

import UserMenu from './user-menu';

interface TopNavProps {
  isMobile: boolean;
  user?: User;
  setUserLanguages?: ({ lang, name }: { lang: LanguagesISO639; name: string }) => void;
}

const TopNav: React.FC<TopNavProps> = ({ isMobile, user, setUserLanguages }) => {
  return (
    <div className="fixed z-10 md:relative w-full flex items-center justify-between p-1 pr-4 bg-zinc-100 md:bg-transparent bg-opacity-80 md:pb-3">
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

import React, { FC } from 'react';
import ChatButton from '@/components/specialButtons/chat_button';
import CreateButton from '@/components/specialButtons/create_button';

import { AppSidebarProps } from './app_sidebar';
import { NavMain } from './nav_main';
import UserMenu from './user-menu';

// type MobileNavbarProps = {
//   user: User;
//   pages: any[];
//   setUserLanguages: ({ lang, name }: { lang: LanguagesISO639; name: string }) => void;
// };
const MobileNavbar: FC<AppSidebarProps> = ({ user, pages, setUserLanguages }) => {
  const mobilePages = pages.filter((page) => page.mobile);
  return (
    <div className="fixed z-30 bottom-3 right-3 left-3 p-2 pr-3 flex h-16 drop-shadow-lg bg-sidebar rounded-iPhone items-center justify-between">
      <CreateButton isMobile />
      <NavMain items={mobilePages} className="px-2" mobile />
      <ChatButton />
      {/* <UserMenu user={user} setUserLanguages={setUserLanguages} mobile /> */}
    </div>
  );
};

export default MobileNavbar;

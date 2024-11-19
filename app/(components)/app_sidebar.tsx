'use client';

import { User } from '@supabase/supabase-js';
import { BookA, Home, Inbox, Library, LucidePartyPopper, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useWindowSize } from 'react-use';
import Logo from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useUserContext } from '@/contexts/user_context';
import { updateUserLanguage } from '@/lib/actions/userActions';
import { LanguagesISO639 } from '@/lib/lists';

import LanguageChooser from './language_chooser';
import LanguageMenu from './language_selector';
import { NavMain } from './nav_main';
import UserMenu from './user-menu';

const pages = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
    isActive: true,
  },
  {
    title: 'Lessons',
    url: '/lessons',
    icon: LucidePartyPopper,
    badge: '10',
  },
  {
    title: 'Library',
    url: '/library',
    icon: Library,
    badge: '10',
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
    badge: '10',
  },
  {
    title: 'Ask AI',
    url: '#',
    icon: Sparkles,
  },
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
];

type AppSidebarProps = {
  user: User;
};

export function AppSidebar({ user }: AppSidebarProps) {
  const { userLanguage, prefLanguage } = useUserContext();
  const isMobile = useWindowSize().width < 768;

  const setUserLanguages = async ({ lang, name }: { lang: LanguagesISO639; name: string }) => {
    if (name === 'userLanguage') {
      await updateUserLanguage({
        userLanguage: lang,
        prefLanguage: prefLanguage ?? null,
      });
    }
    if (name === 'prefLanguage') {
      await updateUserLanguage({
        userLanguage: userLanguage ?? null,
        prefLanguage: lang,
      });
    }
  };
  if (isMobile) {
    return (
      <div className="fixed z-40 bottom-2 right-2 left-2 p-2 flex h-14 drop-shadow-lg bg-sidebar rounded-md items-center">
        <NavMain items={pages} className="px-2" mobile />

        <UserMenu user={user} setUserLanguages={setUserLanguages} mobile />
      </div>
    );
  }

  return (
    <Sidebar variant="floating">
      <SidebarHeader />
      <div className="mx-3 mb-3">
        <Logo logoUrl={'/icons/drill-logo.png'} />
      </div>{' '}
      <NavMain items={pages} className="px-2" />
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="px-2 gap-1 my-2">
          <LanguageChooser setUserLanguages={setUserLanguages} />
        </SidebarMenu>
        <SidebarMenu className="">
          <SidebarMenuItem>
            <UserMenu user={user} setUserLanguages={setUserLanguages} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

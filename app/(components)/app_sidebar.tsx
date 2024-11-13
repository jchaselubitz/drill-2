'use client';

import { User } from '@supabase/supabase-js';
import { Home, Inbox, Library, LucidePartyPopper, Search, Sparkles } from 'lucide-react';
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
import { updateUserLanguage } from '@/lib/actions/userActions';
import { LanguagesISO639 } from '@/lib/lists';

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
  username: string | null | undefined;
  imageUrl: string | null | undefined;
  userLanguage: LanguagesISO639 | null | undefined;
  prefLanguage: LanguagesISO639 | null | undefined;
};

export function AppSidebar({
  user,
  username,
  imageUrl,
  userLanguage,
  prefLanguage,
}: AppSidebarProps) {
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

  return (
    <Sidebar>
      <SidebarHeader />
      <div className="mx-3 mb-3">
        <Logo logoUrl={'/icons/drill-logo.png'} />
      </div>{' '}
      <NavMain items={pages} />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <LanguageMenu
              label="User Language"
              name="userLanguage"
              language={userLanguage}
              onClick={setUserLanguages}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LanguageMenu
              label="Study Language"
              name="prefLanguage"
              language={prefLanguage}
              onClick={setUserLanguages}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu user={user} username={username} imageUrl={imageUrl} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

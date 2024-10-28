'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import UserButton from './user_button';
import Logo from '@/components/logo';
import { Home, Inbox, Search, Sparkles } from 'lucide-react';
import { NavMain } from './nav_main';
import UserMenu from './user-menu';
import { User } from '@supabase/supabase-js';
import LanguageMenu from './language_selector';
import { updateUserLanguage } from '@/lib/actions/userActions';
import { Iso639LanguageCode } from 'kysely-codegen';

const pages = [
  {
    title: 'Search',
    url: '#',
    icon: Search,
  },
  {
    title: 'Ask AI',
    url: '#',
    icon: Sparkles,
  },
  {
    title: 'Home',
    url: '#',
    icon: Home,
    isActive: true,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
    badge: '10',
  },
];

type AppSidebarProps = {
  user: User;
  username: string | null | undefined;
  imageUrl: string | null | undefined;
  userLanguage: Iso639LanguageCode | null | undefined;
  prefLanguage: Iso639LanguageCode | null | undefined;
};

export function AppSidebar({
  user,
  username,
  imageUrl,
  userLanguage,
  prefLanguage,
}: AppSidebarProps) {
  const setUserLanguages = async ({ lang, name }: { lang: Iso639LanguageCode; name: string }) => {
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

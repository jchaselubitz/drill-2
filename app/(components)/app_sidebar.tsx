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
import { LanguagesISO639 } from '@/lib/lists';

import LanguageChooser from './language_chooser';
import { NavMain } from './nav_main';
import UserMenu from './user-menu';

export type AppSidebarProps = {
  user: User;
  pages: any[];
  setUserLanguages: ({ lang, name }: { lang: LanguagesISO639; name: string }) => void;
};

export function AppSidebar({ user, pages, setUserLanguages }: AppSidebarProps) {
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

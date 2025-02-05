'use client';

import { User } from '@supabase/supabase-js';
import DeveloperPlug from '@/components/developer_plug';
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

import LanguageChooser from './language_chooser';
import { NavMain } from './nav_main';
import UserMenu from './user-menu';

export type AppSidebarProps = {
  user: User;
  pages: any[];
};

export function AppSidebar({ user, pages }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader />
      <div className="mx-3 mb-3">
        <Logo logoUrl={'/icons/drill-logo.png'} />
      </div>{' '}
      <NavMain items={pages} className="px-2" />
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="px-2 gap-1 my-2">
          <LanguageChooser />
        </SidebarMenu>
        <SidebarMenu className="">
          <SidebarMenuItem>
            <UserMenu user={user} />
          </SidebarMenuItem>
          <DeveloperPlug />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

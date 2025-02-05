'use client';

import { User } from '@supabase/supabase-js';
import { MessageSquareDiff, Youtube } from 'lucide-react';
import Link from 'next/link';
import DeveloperPlug from '@/components/developer_plug';
import Logo from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import { DemoVideoURL } from '../page';
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
      <SidebarContent>
        <NavMain items={pages} className="px-2" />
        <Separator />
        <SidebarMenu className="px-2">
          <SidebarMenuItem key={1}>
            <SidebarMenuButton asChild={true}>
              <Link href={`/feedback/`} className="flex items-center gap-1 ">
                <MessageSquareDiff className="h-5 w-5" />
                <span>Feedback</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild={true}>
              <a
                href={DemoVideoURL}
                target="_blank"
                referrerPolicy="no-referrer"
                className="flex items-center gap-1 "
              >
                <Youtube className="h-5 w-5" />
                <span>Tutorial</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
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

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
};

export function AppSidebar({ user, username, imageUrl }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader />
      <div className="mx-3 mb-3">
        <Logo logoUrl={'/icons/drill-logo.png'} />
      </div>{' '}
      <NavMain items={pages} />
      <SidebarContent>
        <SidebarGroup />
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

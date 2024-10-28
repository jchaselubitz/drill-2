'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import Link from 'next/link';
import { Building2Icon, ChevronsUpDown, LogOut, MessageSquareDiff, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/actions/userActions';

import { FC } from 'react';
import { SidebarMenuButton } from '@/components/ui/sidebar';

type UserMenuProps = {
  user: any;
  username?: string | null;
  imageUrl?: string | null | undefined;
};

const UserMenu: FC<UserMenuProps> = ({ user, username, imageUrl }) => {
  const userEmail = user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={imageUrl ? imageUrl : 'https://github.com/shadcn.png'}
                alt="@userImage"
                className="h-full w-full rounded-lg"
              />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{username}</span>
              <span className="truncate text-xs">{username}</span>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <span>{name ?? userEmail}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* <DropdownMenuItem asChild>
          <Link href={`/${organizationId}/settings/`}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${organizationId}/feedback/`}>
            <MessageSquareDiff className="mr-2 h-4 w-4" />
            <span>Feedback</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator /> */}

        <DropdownMenuItem
          onClick={(e: any) => {
            e.preventDefault();
            signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

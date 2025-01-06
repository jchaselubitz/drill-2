'use client';

import { User } from '@supabase/supabase-js';
import { Iso639LanguageCode } from 'kysely-codegen';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar';
import { useUserContext } from '@/contexts/user_context';
import { signOut } from '@/lib/actions/userActions';

import LanguageChooser from './language_chooser';

type UserMenuProps = {
  user: User | null | undefined;
  mobile?: boolean;
  setUserLanguages?: ({ lang, name }: { lang: Iso639LanguageCode; name: string }) => void;
};

const UserMenu: FC<UserMenuProps> = ({ user, mobile, setUserLanguages }) => {
  const { username, imageUrl } = useUserContext();
  const userEmail = user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className={
            'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-fit md:w-full p-0 pl-1 md:p-2'
          }
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
            {!mobile && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{username}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <span>{userEmail}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!!setUserLanguages && (
          <>
            <SidebarMenu className="px-2 gap-1 my-4">
              <LanguageChooser />
            </SidebarMenu>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/settings/`}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {/*  <DropdownMenuItem asChild>
          <Link href={`/${organizationId}/feedback/`}>
            <MessageSquareDiff className="mr-2 h-4 w-4" />
            <span>Feedback</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator /> */}

        <DropdownMenuItem
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

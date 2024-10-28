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
import { getLangIcon, getLangName, Languages } from '@/lib/lists';
import { Iso639LanguageCode } from 'kysely-codegen';

type LanguageMenuProps = {
  label: string;
  name: string;
  language: string | null;
  onClick?: ({ lang, name }: { lang: Iso639LanguageCode; name: string }) => void;
};

const LanguageMenu: FC<LanguageMenuProps> = ({ label, name, language, onClick }) => {
  const handleClick = (lang: Iso639LanguageCode) => {
    if (onClick) {
      onClick({ lang, name });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{getLangIcon(language)}</span>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {label}: {getLangName(language)}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {Languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleClick(lang.value as Iso639LanguageCode)}
          >
            <span className="text-lg font-bold">{getLangIcon(lang.value)}</span>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{getLangName(lang.value)}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageMenu;

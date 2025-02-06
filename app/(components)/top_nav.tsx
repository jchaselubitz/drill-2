import { User } from '@supabase/supabase-js';
import React from 'react';
import BackButton from '@/components/back_button';
import CreateButton from '@/components/specialButtons/create_button';
import { SidebarTrigger } from '@/components/ui/sidebar';

import UserMenu from './user-menu';
import { MessageSquareDiff } from 'lucide-react';
import Link from 'next/link';

interface TopNavProps {
  isMobile: boolean;
  user?: User;
}

const TopNav: React.FC<TopNavProps> = ({ isMobile, user }) => {
  return (
    <div className="fixed z-10 md:relative w-full flex items-center justify-between h-14 pr-4 bg-zinc-50 backdrop-blur-md  border-b border-zinc-200 bg-opacity-20 ">
      <div className="flex items-center">
        {!isMobile && <SidebarTrigger />}
        <BackButton showLabel={!isMobile} />
      </div>
      {!isMobile ? (
        <CreateButton />
      ) : (
        <div className="flex items-center gap-4">
          <Link href={`/feedback/`} className="flex items-center gap-1 text-orange-700 ">
            <MessageSquareDiff className="h-5 w-5" />
          </Link>
          <UserMenu user={user} isMobile={isMobile} />
        </div>
      )}
    </div>
  );
};

export default TopNav;

import React from 'react';
import BackButton from '@/components/back_button';
import CreateButton from '@/components/specialButtons/create_button';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface TopNavProps {
  isMobile: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ isMobile }) => {
  return (
    <div className="fixed md:relative w-full flex items-center justify-between p-2 pr-4 bg-zinc-100 md:bg-transparent bg-opacity-80">
      <div className="flex items-center">
        {!isMobile && <SidebarTrigger />}
        <BackButton showLabel={!isMobile} />
      </div>
      {!isMobile && <CreateButton />}
    </div>
  );
};

export default TopNav;

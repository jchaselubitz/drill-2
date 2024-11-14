import { FC } from 'react';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/server';

import UserMenu from './user-menu';

type UserButtonProps = {
  organizationId: string;
};

const UserButton: FC<UserButtonProps> = async () => {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu user={user.data.user} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserButton;

import { FC } from 'react';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { getProfile } from '@/lib/actions/userActions';
import { createClient } from '@/utils/supabase/server';

import UserMenu from './user-menu';

type UserButtonProps = {
  organizationId: string;
};

const UserButton: FC<UserButtonProps> = async () => {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const profile = await getProfile();
  const username = profile?.username;
  const imageUrl = profile?.imageUrl;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu user={user.data.user} username={username} imageUrl={imageUrl} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserButton;

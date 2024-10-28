import { createClient } from '@/utils/supabase/server';

import UserMenu from './user-menu';
import { FC } from 'react';
import { getProfile } from '@/lib/actions/userActions';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

type UserButtonProps = {
  organizationId: string;
};

const UserButton: FC<UserButtonProps> = async ({ organizationId }) => {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const profile = await getProfile({ userId: user.data.user?.id });
  const imageUrl = profile?.imageUrl;
  const username = profile?.username;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu user={user.data.user} username={username} imageUrl={imageUrl} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserButton;

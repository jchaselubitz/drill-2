'use client';

import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function NavMain({
  items,
  className,
  mobile,
}: {
  className?: string;
  mobile?: boolean;
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  const pathname = usePathname();
  items = items.map((item) => ({
    ...item,
    isActive: item.url === pathname,
  }));

  return (
    <SidebarMenu
      className={cn(className, mobile && 'flex flex-row gap-3 items-center justify-center w-58')}
    >
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild={!mobile}
            isActive={item.isActive}
            className={cn(
              mobile &&
                'data-[active=true]:border-slate-500 data-[active=true]:border-2 rounded-full h-12 w-12 items-center justify-center'
            )}
          >
            <Link href={item.url}>
              <item.icon />
              {!mobile && <span>{item.title}</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

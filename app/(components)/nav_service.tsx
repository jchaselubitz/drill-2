'use client';

import { User } from '@supabase/supabase-js';
import { Home, Inbox, Library, LucidePartyPopper, Search, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWindowSize } from 'react-use';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUserContext } from '@/contexts/user_context';
import { updateUserLanguage } from '@/lib/actions/userActions';
import { LanguagesISO639 } from '@/lib/lists';

import { AppSidebar } from './app_sidebar';
import MobileNavbar from './mobile_navbar';

export function NavService({ user, children }: { user: User; children: React.ReactNode }) {
  const { userLanguage, prefLanguage } = useUserContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile); // Listen for changes

    return () => window.removeEventListener('resize', checkIfMobile);
  }, [setIsMobile]);

  const setUserLanguages = async ({ lang, name }: { lang: LanguagesISO639; name: string }) => {
    if (name === 'userLanguage') {
      await updateUserLanguage({
        userLanguage: lang,
        prefLanguage: prefLanguage ?? null,
      });
    }
    if (name === 'prefLanguage') {
      await updateUserLanguage({
        userLanguage: userLanguage ?? null,
        prefLanguage: lang,
      });
    }
  };

  const pages = [
    {
      title: 'Home',
      url: '/',
      icon: Home,
      isActive: true,
      mobile: true,
    },
    {
      title: 'Lessons',
      url: '/lessons',
      icon: LucidePartyPopper,
      badge: '10',
      mobile: true,
    },
    {
      title: 'Library',
      url: '/library',
      icon: Library,
      badge: '10',
      mobile: true,
    },
    {
      title: 'Inbox',
      url: '#',
      icon: Inbox,
      badge: '10',
      mobile: false,
    },
    {
      title: 'Ask AI',
      url: '#',
      icon: Sparkles,
      mobile: true,
    },
    {
      title: 'Search',
      url: '#',
      icon: Search,
      mobile: false,
    },
  ];

  return (
    <>
      <AppSidebar user={user} setUserLanguages={setUserLanguages} pages={pages} />
      <main className="w-full h-full flex flex-col pt-14 md:pt-0 md:pb-12">
        {!isMobile && <SidebarTrigger />}
        <div className="flex justify-center pb-24 md:justify-normal h-full  ">{children}</div>
        {isMobile && <MobileNavbar user={user} setUserLanguages={setUserLanguages} pages={pages} />}
      </main>
    </>
  );
}

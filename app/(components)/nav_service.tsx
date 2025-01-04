'use client';

import { User } from '@supabase/supabase-js';
import { Edit, Home, Library, LucidePartyPopper, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChatContext } from '@/contexts/chat_window_context';
import { useUserContext } from '@/contexts/user_context';
import { updateUserLanguage } from '@/lib/actions/userActions';
import { setUserLanguages } from '@/lib/helpers/helpersUser';
import { LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

import { AppSidebar } from './app_sidebar';
import MobileNavbar from './mobile_navbar';
import TopNav from './top_nav';

export function NavService({ user, children }: { user: User; children: React.ReactNode }) {
  const { userLanguage, prefLanguage } = useUserContext();
  const { chatOpen } = useChatContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile); // Listen for changes

    return () => window.removeEventListener('resize', checkIfMobile);
  }, [setIsMobile]);

  useEffect(() => {
    const hasUserLanguage = userLanguage !== null && userLanguage !== undefined;
    if (!hasUserLanguage) {
      const userLanguage = navigator.language as LanguagesISO639;
      const iso639Code = userLanguage.split('-')[0] as LanguagesISO639;
      setUserLanguages({
        lang: iso639Code,
        name: 'userLanguage',
        prefLanguage: prefLanguage ?? null,
        userLanguage: userLanguage ?? null,
      });
    }
  });

  const pages = [
    {
      title: 'Home',
      url: '/',
      icon: Home,
      isActive: true,
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
      title: 'Lessons',
      url: '/lessons',
      icon: LucidePartyPopper,
      badge: '10',
      mobile: true,
    },

    // {
    //   title: 'Inbox',
    //   url: '#',
    //   icon: Inbox,
    //   badge: '10',
    //   mobile: false,
    // },
    {
      title: 'Tutor',
      url: '/tutor',
      icon: Edit,
      mobile: true,
    },
    // {
    //   title: 'Search',
    //   url: '#',
    //   icon: Search,
    //   mobile: false,
    // },
  ];

  return (
    <>
      {!isMobile && <AppSidebar user={user} pages={pages} />}
      <main className={cn('w-full h-full flex flex-col')}>
        {isMobile && <TopNav isMobile={true} user={user} />}
        <div className={cn('flex justify-center pt-12 md:pt-0 md:justify-normal h-full ')}>
          {children}
        </div>
        {isMobile && <MobileNavbar user={user} pages={pages} />}
      </main>
    </>
  );
}

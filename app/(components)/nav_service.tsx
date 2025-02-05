'use client';

import { User } from '@supabase/supabase-js';
import { Iso639LanguageCode } from 'kysely-codegen';
import { Edit, Home, Library, LucidePartyPopper, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { setUserLanguages } from '@/lib/helpers/helpersUser';
import { cn } from '@/lib/utils';

import { AppSidebar } from './app_sidebar';
import CompleteAccountDialog from './complete_account_dialog';
import MobileNavbar from './mobile_navbar';
import TopNav from './top_nav';

export function NavService({ user, children }: { user: User; children: React.ReactNode }) {
  const { userLanguage, prefLanguage } = useUserContext();
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
      const userLanguage = navigator.language as Iso639LanguageCode;
      const iso639Code = userLanguage.split('-')[0] as Iso639LanguageCode;
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
        {isMobile ? (
          <TopNav user={user} isMobile={isMobile} />
        ) : (
          user.is_anonymous && <CompleteAccountDialog />
        )}

        <div className={cn('flex justify-center pt-12 md:pt-0 md:justify-normal h-full ')}>
          {children}
        </div>
        {isMobile && <MobileNavbar user={user} pages={pages} />}
      </main>
    </>
  );
}

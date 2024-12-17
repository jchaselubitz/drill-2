'use client';

import { User } from '@supabase/supabase-js';
import { Home, Library, LucidePartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChatContext } from '@/contexts/chat_window_context';
import { useUserContext } from '@/contexts/user_context';
import { updateUserLanguage } from '@/lib/actions/userActions';
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

  useEffect(() => {
    const hasUserLanguage = userLanguage !== null && userLanguage !== undefined;
    if (!hasUserLanguage) {
      const userLanguage = navigator.language;
      const iso639Code = userLanguage.split('-')[0] as LanguagesISO639;
      setUserLanguages({ lang: iso639Code, name: 'userLanguage' });
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

    // {
    //   title: 'Inbox',
    //   url: '#',
    //   icon: Inbox,
    //   badge: '10',
    //   mobile: false,
    // },
    // {
    //   title: 'Ask AI',
    //   url: '#',
    //   icon: Sparkles,
    //   mobile: false,
    // },
    // {
    //   title: 'Search',
    //   url: '#',
    //   icon: Search,
    //   mobile: false,
    // },
  ];

  return (
    <>
      {!isMobile && <AppSidebar user={user} setUserLanguages={setUserLanguages} pages={pages} />}
      <main className={cn('w-full h-full flex flex-col')}>
        {isMobile && <TopNav isMobile={true} user={user} setUserLanguages={setUserLanguages} />}
        <div className={cn('flex justify-center pt-12 md:pt-0 md:justify-normal h-full ')}>
          {children}
        </div>
        {isMobile && <MobileNavbar user={user} setUserLanguages={setUserLanguages} pages={pages} />}
      </main>
    </>
  );
}

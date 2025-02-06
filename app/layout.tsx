import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import PhraseChat from '@/components/ai_elements/phrase_chat';
import LanguageChoiceModal from '@/components/language_choice_modal';
import { DesktopChatButton } from '@/components/specialButtons/chat_button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { ChatWindowProvider } from '@/contexts/chat_window_context';
import { CreateModalProvider } from '@/contexts/create_modal_context';
import { LessonsContextProvider } from '@/contexts/lessons_context';
import { LibraryContextProvider } from '@/contexts/library_context';
import { UserContextProvider } from '@/contexts/user_context';
import { getUserHistory } from '@/lib/actions/actionsHistory';
import { getLessonList } from '@/lib/actions/lessonActions';
import { getProfile } from '@/lib/actions/userActions';
import { DemoVideoURL } from '@/lib/helpers/helpersMarketing';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';

import { CreateDialog } from './(components)/create_dialog';
import { NavService } from './(components)/nav_service';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Drill AI',
  description: 'Create learning content.',
  generator: 'Next.js',
  keywords: ['Drill', 'Learning', 'content generation', 'study', 'anki'],
  manifest: `/manifest.json`,
  openGraph: {
    url: defaultUrl,
    siteName: 'Drill AI',
    images: [
      {
        url: `${defaultUrl}/images/drill_ai_header.png`, // Must be an absolute URL
        width: 1200,
        height: 675,
      },
    ],
    videos: [
      {
        url: DemoVideoURL, // Must be an absolute URL
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
  appleWebApp: {
    title: 'Drill AI',
    statusBarStyle: 'default',
    capable: true,
    startupImage: [
      '/images/icons/drill-logo.png',
      {
        url: '/images/iphone-splash.png',
        media: '(device-width: 390px) and (device-height: 844px)',
      },
      {
        url: '/images/ipad-pro-splash.png',
        media: '(device-width: 834px) and (device-height: 1366px)',
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const profile = await getProfile();
  const history = await getUserHistory();
  const lessonList = await getLessonList();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={cn(
          'bg-background bg-white font-sans antialiased flex- flex-col ',
          fontSans.variable
        )}
      >
        {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
        {user ? (
          <UserContextProvider profile={profile} userHistory={history} user={user}>
            <CreateModalProvider>
              <SidebarProvider>
                <LibraryContextProvider>
                  <LessonsContextProvider lessons={lessonList}>
                    <ChatWindowProvider>
                      <NavService user={user}>{children}</NavService>
                      <div className="relative max-h-screen">
                        <PhraseChat />
                        <DesktopChatButton />
                      </div>
                    </ChatWindowProvider>
                  </LessonsContextProvider>
                </LibraryContextProvider>
              </SidebarProvider>
              <CreateDialog />
            </CreateModalProvider>
            <LanguageChoiceModal />
          </UserContextProvider>
        ) : (
          <>{children}</>
        )}
        <Toaster />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}

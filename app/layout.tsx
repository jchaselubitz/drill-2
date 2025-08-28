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
import { Analytics } from '@vercel/analytics/next';

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
      `/splash-images/apple-splash-1320-2868.jpg`,
      {
        url: '/splash-images/apple-splash-2048-2732.jpg',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2732-2048.jpg',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1668-2388.jpg',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2388-1668.jpg',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1536-2048.jpg',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2048-1536.jpg',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1488-2266.jpg',
        media:
          '(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2266-1488.jpg',
        media:
          '(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1640-2360.jpg',
        media:
          '(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2360-1640.jpg',
        media:
          '(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1668-2224.jpg',
        media:
          '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2224-1668.jpg',
        media:
          '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1620-2160.jpg',
        media:
          '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2160-1620.jpg',
        media:
          '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1320-2868.jpg',
        media:
          '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2868-1320.jpg',
        media:
          '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1206-2622.jpg',
        media:
          '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2622-1206.jpg',
        media:
          '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1290-2796.jpg',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2796-1290.jpg',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1179-2556.jpg',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2556-1179.jpg',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1284-2778.jpg',
        media:
          '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2778-1284.jpg',
        media:
          '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1170-2532.jpg',
        media:
          '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2532-1170.jpg',
        media:
          '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1125-2436.jpg',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2436-1125.jpg',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1242-2688.jpg',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2688-1242.jpg',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-828-1792.jpg',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-1792-828.jpg',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-1242-2208.jpg',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-2208-1242.jpg',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-750-1334.jpg',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-1334-750.jpg',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
      },
      {
        url: '/splash-images/apple-splash-640-1136.jpg',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/splash-images/apple-splash-1136-640.jpg',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)',
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
        <Analytics />
      </body>
    </html>
  );
}

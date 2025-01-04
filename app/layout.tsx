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
import { LibraryContextProvider } from '@/contexts/library_context';
import { UserContextProvider } from '@/contexts/user_context';
import { getUserHistory } from '@/lib/actions/actionsHistory';
import { getProfile } from '@/lib/actions/userActions';
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
  themeColor: '#f1f5f9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Drill',
  description: 'Create learning content.',
  generator: 'Next.js',
  manifest: `/manifest.json`,
  appleWebApp: {
    title: 'Tasks, Operations & Procedures',
    statusBarStyle: 'default',
    capable: true,
    startupImage: [
      '/assets/images/iphone-splash.png',
      {
        url: '/assets/images/iphone-splash.png',
        media: '(device-width: 390px) and (device-height: 844px)',
      },
      {
        url: '/assets/images/ipad-pro-splash.png',
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={cn('bg-background bg-white font-sans antialiased ', fontSans.variable)}>
        {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
        {user ? (
          <UserContextProvider profile={profile} userHistory={history}>
            <CreateModalProvider>
              <SidebarProvider>
                <LibraryContextProvider>
                  <ChatWindowProvider>
                    <NavService user={user}>{children}</NavService>

                    <div className="relative max-h-screen">
                      <PhraseChat />
                      <DesktopChatButton />
                    </div>
                  </ChatWindowProvider>
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

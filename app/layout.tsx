import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { UserContextProvider } from '@/contexts/user_context';
import { getProfile } from '@/lib/actions/userActions';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';

import { AppSidebar } from './(components)/app_sidebar';

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={cn('bg-background bg-white font-sans antialiased', fontSans.variable)}>
        {user ? (
          <UserContextProvider profile={profile}>
            {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
            <SidebarProvider>
              <AppSidebar user={user} />
              <main className="w-full h-full flex flex-col pt-14 md:pt-0 md:pb-12">
                <SidebarTrigger />
                <div className="flex justify-center pb-24 md:justify-normal h-full  ">
                  {children}
                </div>
              </main>
            </SidebarProvider>
            {/* </ThemeProvider> */}
          </UserContextProvider>
        ) : (
          <>{children}</>
        )}
        <Toaster />
      </body>
    </html>
  );
}

'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Youtube } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAnonymousUser } from '@/lib/actions/userActions';

import LoginForm from './login_form';
import { DemoVideoURL } from '@/lib/helpers/helpersMarketing';
import YouTubePlayer from 'react-player/youtube';

export default function LoginBox({
  token,
  message,
  form,
}: {
  token: string;
  message: string;
  form: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useWindowSize().width < 640;
  const captchaKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? '';
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAnonymousSignIn = async () => {
    await createAnonymousUser();
    return router.push('/');
  };

  return (
    <div className="animate-in items-center flex flex-col w-full px-2 sm:max-w-md justify-center">
      <div className="mb-10 w-full flex flex-col items-center">
        <Button
          className="mb-4 w-full bg-slate-700 hover:bg-slate-600 font-semibold gap-2"
          variant="default"
          size="lg"
          onClick={() => {
            isMobile ? router.push(DemoVideoURL) : setIsOpen(true);
          }}
        >
          Watch the tutorial <div>📺</div>
        </Button>

        <Button
          className="mb-4 w-full  bg-emerald-700 hover:bg-emerald-600 font-semibold"
          variant="default"
          size="lg"
          onClick={() => setShowCaptcha(!showCaptcha)}
        >
          Try it before creating an account <div>🎉</div>
        </Button>
        {showCaptcha && (
          <div className="mb-4">
            <HCaptcha sitekey={captchaKey} onVerify={handleAnonymousSignIn} />
          </div>
        )}
      </div>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Learn about Drill.</DrawerTitle>
            {/* <DrawerDescription>This action cannot be undone.</DrawerDescription> */}
          </DrawerHeader>
          <div className="mx-auto my-10">
            <a href={DemoVideoURL} target="_blank" rel="noreferrer">
              <Button
                className="mb-4 w-full border-slate-700 hover:bg-slate-100 font-semibold gap-2"
                variant="outline"
                size="lg"
              >
                Open in Youtube <Youtube />
              </Button>
            </a>
            <YouTubePlayer
              url="https://youtu.be/uilJL5JW-2g"
              width="1000px"
              height={'600px'}
              controls
              playsinline={true}
            />
          </div>
          <DrawerFooter>
            <DrawerClose className="w-full">
              <Button variant="secondary" className="w-full">
                close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Tabs defaultValue={form ?? 'magic'} className="flex flex-col h-full w-full ">
        <TabsList className="grid grid-cols-2 w-full  rounded-lg ">
          <TabsTrigger
            onClick={() => {
              router.push(`${pathname}?form=magic`);
            }}
            value="magic"
          >
            Magic Link
          </TabsTrigger>
          <TabsTrigger
            onClick={() => {
              router.push(`${pathname}?form=password`);
            }}
            value="password"
          >
            Password
          </TabsTrigger>
        </TabsList>
        <div className="p-4 rounded-lg mt-2 bg-neutral-100">
          <TabsContent value="magic">
            <LoginForm message={message} token={token} isMagicLink />
          </TabsContent>
          <TabsContent value="password">
            <LoginForm message={message} token={token} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

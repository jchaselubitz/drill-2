'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAnonymousUser } from '@/lib/actions/userActions';

import LoginForm from './login_form';

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

  const handleAnonymousSignIn = async () => {
    await createAnonymousUser();
    return router.push('/');
  };

  return (
    <div className="animate-in items-center flex flex-col w-full px-2 sm:max-w-md justify-center">
      <Button
        className="mb-10 w-full bg-emerald-700 hover:bg-emerald-600 font-semibold"
        variant="default"
        size="lg"
        onClick={handleAnonymousSignIn}
      >
        Try it before creating an account 🎉
      </Button>
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

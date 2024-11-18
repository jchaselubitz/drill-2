import { createClient } from '@/utils/supabase/server';
import LoginForm from './(components)/login_form';
import { redirect } from 'next/navigation';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string; token: string }>;
}) {
  const { token, message } = await searchParams;

  // const supabase = createClient();

  // const user = await supabase.auth.getUser();
  // if (user) {
  //   redirect('/');
  // }

  return (
    <div className="animate-in mt-20 md:mt-72 flex flex-col w-full px-8 sm:max-w-md justify-center">
      <LoginForm message={message} token={token} />
    </div>
  );
}

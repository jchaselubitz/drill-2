'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signIn, signInWithEmail, signUp, updatePassword } from '@/lib/actions/userActions';

interface LoginFormProps {
  token?: string | null;
  isPasswordReset?: boolean;
  isMagicLink?: boolean;
  message?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ token, isPasswordReset, isMagicLink, message }) => {
  const router = useRouter();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [signInButtonState, setSignInButtonState] = useState<ButtonLoadingState>('default');
  const isCreateAccount = (!isPasswordReset && !!showCreateAccount) || !!token;

  const zObject = {
    email: z.string().email(),
  } as { [key: string]: any };

  if (!isMagicLink) {
    zObject['password'] = z.string().min(6, { message: 'Password must be at least 6 characters.' });
  }

  if (isCreateAccount) {
    zObject['name'] = z.string().min(3, { message: 'Name must be at least 2 characters.' });
  }
  const FormSchema = z.object(zObject);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmission = async (formInputs: z.infer<typeof FormSchema>) => {
    const { email, password, name } = formInputs;
    const submission = {
      email,
      password,
      token,
      name,
    };
    if (isPasswordReset) {
      updatePassword({ password, nextUrl: '/' });
    }
    setSignInButtonState('loading');

    try {
      if (isMagicLink) {
        await signInWithEmail({ email, shouldCreateUser: isCreateAccount, name });
        setSignInButtonState('success');
        return;
      } else {
        if (!isCreateAccount && !password) {
          setSignInButtonState('error');
        }
        if (isCreateAccount) {
          await signUp(submission);
          setSignInButtonState('success');
          return router.push('/confirm-your-email?email=' + email);
        }
        if (!isCreateAccount) {
          await signIn({ email, password });
          setSignInButtonState('default');
          return router.push('/');
        }
        return;
      }
    } catch (error) {
      setSignInButtonState('error');
      throw Error(`Error signing in ${error}`);
    }
  };

  const submitForm = form.handleSubmit((data) => {
    handleSubmission(data);
  });

  const fieldClass = 'flex flex-col gap-2';
  const buttonText = isPasswordReset
    ? 'Update'
    : isMagicLink
      ? isCreateAccount
        ? 'Send account creation link'
        : 'Send login link'
      : isCreateAccount
        ? 'Create account with password'
        : 'Sign in with password';

  return (
    <Form {...form}>
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-3 text-foreground">
        <div className={fieldClass}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input placeholder={'you@example.com'} {...field} disabled={isPasswordReset} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!isMagicLink && (
          <div className={fieldClass}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="*******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {isCreateAccount && (
          <div className={fieldClass}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mr. Polyglot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <div className={fieldClass}>
          <LoadingButton
            onClick={submitForm}
            variant={'default'}
            buttonState={signInButtonState}
            disabled={
              signInButtonState === 'loading' ||
              signInButtonState === 'disabled' ||
              signInButtonState === 'success'
            }
            text={buttonText}
            loadingText={isCreateAccount ? 'Creating ...' : 'Logging in ...'}
            successText="Check your email for a login link"
            errorText="Error"
          />
        </div>
      </form>
      <Button
        variant="link"
        className="text-sm justify-start pl-0"
        onClick={(e) => {
          e.preventDefault();
          setSignInButtonState('default');
          setShowCreateAccount(!showCreateAccount);
        }}
      >
        {isCreateAccount ? 'Sign in to an existing account' : 'Create a new account'}
      </Button>
      {message && (
        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">{message}</p>
      )}
    </Form>
  );
};

export default LoginForm;

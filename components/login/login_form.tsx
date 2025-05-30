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
  isSignUp?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  token,
  isPasswordReset,
  isMagicLink,
  message,
  isSignUp,
}) => {
  const router = useRouter();

  const [signInButtonState, setSignInButtonState] = useState<ButtonLoadingState>('default');

  const zObject = {
    email: z.string().email(),
  } as { [key: string]: any };

  if (!isMagicLink) {
    zObject['password'] = z.string().min(6, { message: 'Password must be at least 6 characters.' });
    // .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter and one number.' })
    // .regex(/[0-9]/, { message: 'Password must contain at least one letter and number.' });
  }

  if (isSignUp) {
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
        await signInWithEmail({ email, shouldCreateUser: isSignUp, name });
        setSignInButtonState('success');
        router.push('/check-your-email?email=' + email);
        return;
      } else {
        if (!isSignUp && !password) {
          setSignInButtonState('error');
        }
        if (isSignUp) {
          await signUp(submission);
          setSignInButtonState('success');
          router.push('/confirm-your-email?email=' + email);
        }
        if (!isSignUp) {
          try {
            await signIn({ email, password });
            setSignInButtonState('success');
            return router.push('/');
          } catch (error) {
            setSignInButtonState('error');
            throw Error(`Error signing in ${error}`);
          }
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
      ? isSignUp
        ? 'Send account creation link'
        : 'Send login link'
      : isSignUp
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
        {isSignUp && (
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
            loadingText={isSignUp ? 'Creating ...' : 'Logging in ...'}
            successText={isMagicLink ? 'Check your email for a login link' : 'Loading ...'}
            errorText="Error"
          />
        </div>
      </form>
      <Button
        variant={isSignUp ? 'link' : 'outline'}
        className="text-sm justify-start  mt-2"
        onClick={(e) => {
          e.preventDefault();
          setSignInButtonState('default');
          isSignUp ? router.push('/login') : router.push('/sign-up');
        }}
      >
        {isSignUp ? 'Sign in to an existing account' : 'Create a new account'}
      </Button>
      {message && (
        <div className="rounded-lg border border-red-700 mt-4 p-2 bg-foreground/10 text-red-700 opacity-80 text-center">
          {message}
        </div>
      )}
    </Form>
  );
};

export default LoginForm;

'use client';

import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { signIn, signInWithEmail, signUp, updatePassword } from '@/lib/actions/userActions';

interface LoginFormProps {
  token?: string | null;
  isPasswordReset?: boolean;
  isMagicLink?: boolean;
  message?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ token, isPasswordReset, isMagicLink, message }) => {
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [signInButtonState, setSignInButtonState] = useState<ButtonLoadingState>('default');
  const isCreateAccount = (!isPasswordReset && !!showCreateAccount) || !!token;

  const zObject = {
    email: z.string().email(),
  } as { [key: string]: any };

  !isMagicLink &&
    (zObject['password'] = z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }));

  isCreateAccount &&
    (zObject['name'] = z.string().min(3, { message: 'Name must be at least 2 characters.' }));

  const FormSchema = z.object(zObject);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onBlur',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmission = async (formInputs: z.infer<typeof FormSchema>) => {
    const { email, password, name } = formInputs;
    let submission = {
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
      } else {
        isCreateAccount ? await signUp(submission) : await signIn(submission);
        setSignInButtonState('default');
      }
    } catch (error) {
      setSignInButtonState('error');
    }
  };

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
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-3 text-foreground"
        onSubmit={form.handleSubmit((data) => {
          handleSubmission(data);
        })}
      >
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
                    <Input placeholder="Kirk Vartan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <div className={fieldClass}>
          <LoadingButton
            type="submit"
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
      </form>
      {message && (
        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">{message}</p>
      )}
    </Form>
  );
};

export default LoginForm;

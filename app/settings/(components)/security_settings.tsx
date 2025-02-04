'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { updateEmail, updatePassword } from '@/lib/actions/userActions';

const EmailSettingsSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

const SecuritySettingsSchema = z.object({
  password: z
    .string()
    .min(6, {
      message: 'Password must be at least 6 characters.',
    })
    .max(40, {
      message: 'Password must not be longer than 40 characters.',
    }),
  passwordRepeat: z
    .string()
    .min(6, {
      message: 'Password must be at least 6 characters.',
    })
    .max(40, {
      message: 'Password must not be longer than 40 characters.',
    }),
});

export function SecuritySettings({
  hasPassword,
  userEmail,
}: {
  hasPassword: boolean;
  userEmail: string | undefined;
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  type EmailSettingsValue = z.infer<typeof EmailSettingsSchema>;
  type SecuritySettingsValues = z.infer<typeof SecuritySettingsSchema>;

  const emailDefaultValues: Partial<EmailSettingsValue> = {
    email: userEmail ?? '',
  };

  const passwordDefaultValues: Partial<SecuritySettingsValues> = {
    password: '',
    passwordRepeat: '',
  };

  const emailForm = useForm<EmailSettingsValue>({
    resolver: zodResolver(EmailSettingsSchema),
    defaultValues: emailDefaultValues,
    mode: 'onChange',
  });

  const passwordForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(SecuritySettingsSchema),
    defaultValues: passwordDefaultValues,
    mode: 'onChange',
  });

  async function onEmailSubmit(data: EmailSettingsValue) {
    const error = await updateEmail(data.email);
    if (error) {
      alert('Could not update email');
    }
  }
  async function onPasswordSubmit(data: SecuritySettingsValues) {
    if (data.password !== data.passwordRepeat) {
      passwordForm.setError('passwordRepeat', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }
    setShowPasswordForm(false);

    const error = await updatePassword({ password: data.password });
    if (error) {
      if (error.message.includes('should be different from the old password')) {
        alert('Password must be different from the old password.');
      }
    }
  }

  return (
    <div className="space-y-4 flex flex-col">
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 flex flex-col">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="darth@vader.com" {...field} />
                </FormControl>
                {/* <FormDescription>This is your public display name.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Change email</Button>
        </form>
        <Separator className="my-4" />
      </Form>
      {!showPasswordForm ? (
        <div className=" space-y- flex flex-col gap-2">
          <Button onClick={() => setShowPasswordForm(!showPasswordForm)} className="w-fit">
            {hasPassword ? 'Set new password' : 'Change password'}
          </Button>
          {hasPassword && (
            <span className="text-sm text-gray-700">
              {' '}
              Adding a password will let you access your account with an email and password, as well
              as any other methods you have set up.{' '}
            </span>
          )}
        </div>
      ) : (
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4 flex flex-col"
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="**********" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="passwordRepeat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="**********" {...field} />
                  </FormControl>
                  <FormDescription>
                    Adding a password will let you access your account with an email and password,
                    as well as any other methods you have set up.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Set new Password</Button>
          </form>
        </Form>
      )}
    </div>
  );
}

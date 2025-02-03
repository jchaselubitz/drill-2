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
import { updatePassword } from '@/lib/actions/userActions';

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
  providers,
}: {
  hasPassword: boolean;
  providers: string[] | undefined;
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  type SecuritySettingsValues = z.infer<typeof SecuritySettingsSchema>;

  // This can come from your database or API.
  const defaultValues: Partial<SecuritySettingsValues> = {
    password: '',
    passwordRepeat: '',
  };

  const form = useForm<SecuritySettingsValues>({
    resolver: zodResolver(SecuritySettingsSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: SecuritySettingsValues) {
    if (data.password !== data.passwordRepeat) {
      form.setError('passwordRepeat', {
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
    <div>
      {!showPasswordForm ? (
        <div className="flex flex-col gap-2">
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
            <FormField
              control={form.control}
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
              control={form.control}
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

'use server';

import { headers } from 'next/headers';
import db from '../database';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { LanguagesISO639 } from '../lists';
import { ProfileWithMedia } from 'kysely-codegen';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const getProfile = async (): Promise<ProfileWithMedia | null | undefined> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profileWithMedia = await db
    .selectFrom('profile')
    .leftJoin('userMedia', 'userMedia.profileId', 'profile.id')
    .select(({ eb }) => [
      'profile.id as id',
      'userLanguage',
      'prefLanguage',
      'imageUrl as imageUrl',
      'username',
      'profile.createdAt as createdAt',
      'updatedAt',
      jsonArrayFrom(
        eb
          .selectFrom('media')
          .selectAll()
          .whereRef('userMedia.mediaId', '=', 'media.id')
          .orderBy('createdAt', 'desc')
      ).as('media'),
    ])
    .where('profile.id', '=', user.id)
    .executeTakeFirst();

  const profile = profileWithMedia as ProfileWithMedia;

  return profile;
};

export async function signInWithEmail({
  email,
  shouldCreateUser,
  name,
}: {
  email: string;
  name?: string;
  shouldCreateUser?: boolean;
}) {
  const supabase = createClient();
  const headersList = await headers();
  const origin = headersList.get('origin');

  if (shouldCreateUser && !name) {
    return redirect('/login?message=Name required to create account');
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name,
      },
    },
  });
  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }
  return redirect('/');
}

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  const supabase = createClient();
  console.time('signIn');
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }
  console.timeEnd('signIn');
  return redirect('/');
};

export const signUp = async ({
  email,
  password,
  name,
  token,
  inviteEmail,
}: {
  email: string;
  password: string;
  name: string;
  token: string | null | undefined;
  inviteEmail?: string;
}) => {
  const supabase = createClient();
  const headersList = await headers();
  const origin = headersList.get('origin');
  if (!inviteEmail && !email) {
    return redirect('/login?message=Missing required fields');
  }
  const { error, data } = await supabase.auth.signUp({
    email: inviteEmail ?? (email as string),
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        name,
        has_password: true,
      },
    },
  });
  // const newUser = data.user?.id;
  // if (newUser && token) {
  //   await applyUserRole({ userId: newUser, token });
  // }

  if (error) {
    console.log(error);
    return redirect(`/login?message=Could not authenticate user${token ? '&code=' + token : ''}`);
  }

  return redirect('/confirm-your-email?email=' + email);
};

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return redirect('/login?message=Could not sign out');
  }
};

export const requestReset = async ({ email }: { email: string }) => {
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });
  return redirect('/login/reset?message=Password reset email sent');
};

export const updatePassword = async ({
  password,
  nextUrl,
}: {
  password: string;
  nextUrl?: string;
}) => {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password,
    data: { has_password: true },
  });

  if (error) {
    return redirect('/login/reset?message=error-changing-password');
  }

  if (nextUrl) return redirect(nextUrl);
};

export const updateEmail = async (formData: FormData) => {
  const supabase = createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.updateUser({
    email,
  });

  if (error) {
    return redirect('/login?message=error-changing-email');
  }

  return redirect('/');
};

export const updateUserLanguage = async ({
  userLanguage,
  prefLanguage,
}: {
  userLanguage: LanguagesISO639 | null;
  prefLanguage: LanguagesISO639 | null;
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return;
  }

  await db
    .updateTable('profile')
    .set({ userLanguage, prefLanguage })
    .where('id', '=', userId)
    .execute();

  revalidatePath('/');
};


'use server';

import { headers } from "next/headers";
import db from '../database';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from "@/utils/supabase/server";

export const getProfile = async ({ userId }: { userId: string | undefined }) => {

  if (!userId) {
    return undefined;
  }
  return await db.selectFrom('profile').selectAll().where('id', '=', userId).executeTakeFirst();
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
 const origin = headers().get('origin');

 if (shouldCreateUser && !name) {
   return redirect('/login?message=Name required to create account');
 }
 const { data, error } = await supabase.auth.signInWithOtp({
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
 inviteEmail
}: {
 email: string;
 password: string;
 name: string;
 token: string | null | undefined;
 inviteEmail?: string;
}) => {
 const supabase = createClient();
 const origin = headers().get('origin');
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

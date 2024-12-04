import { copycat } from '@snaplet/copycat';
import { createSeedClient } from '@snaplet/seed';
import { hash } from 'bcryptjs'; // Import bcrypt for hashing

async function main() {
  const seed = await createSeedClient({ dryRun: true });
  await seed.$resetDatabase();
  const plainPassword = '123456';
  const hashedPassword = await hash(plainPassword, 10); // Hash the password with bcrypt

  // Seed users
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let { users } = await seed.users([
    {
      instance_id: '00000000-0000-0000-0000-000000000000',
      email: 'jake@c.com',
      banned_until: null,
      role: 'authenticated',
      aud: 'authenticated',
      is_super_admin: false,
      deleted_at: null,
      encrypted_password: hashedPassword,
      invited_at: null,
      confirmation_token: '',
      confirmation_sent_at: null,
      recovery_token: '',
      recovery_sent_at: null,
      email_change_token_new: '',
      email_change: '',
      email_change_sent_at: null,
      last_sign_in_at: null,
      raw_app_meta_data: {
        provider: 'email',
        providers: ['email'],
      },
      raw_user_meta_data: {
        name: 'jake',
        email: 'jake@c.com',
      },
    },
  ]);

  const additionalUsers = await seed.users((x) =>
    x(10, {
      email: (ctx) =>
        copycat.email(ctx.seed, {
          domain: 'acme.org',
        }),
      instance_id: '00000000-0000-0000-0000-000000000000',
      banned_until: null,
      role: 'authenticated',
      aud: 'authenticated',

      invited_at: null,
      confirmation_token: null,
      recovery_token: null,
      is_super_admin: false,
      deleted_at: null,
      raw_app_meta_data: {
        provider: 'email',
        providers: ['email'],
      },
      //@ts-ignore
      raw_user_meta_data: (ctx) => ({
        name: ctx.data.email?.split('@')[0],
        email: ctx.data.email,
      }),
    })
  );

  users = [...users, ...additionalUsers.users];
}

main().catch(console.error);

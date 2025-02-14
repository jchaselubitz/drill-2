import React from 'react';

export default async function EmailConfirmationPage({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  const { email } = searchParams;
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="flex flex-col items-center w-64 md:w-96 text-center p-3 rounded-lg bg-zinc-100">
        <h1 className="text-lg font-semibold mb-2">{`Check your email.`}</h1>
        <p className="">{`Click the link we emailed to ${email ? email : 'you'} to log in.`}</p>
      </div>
    </div>
  );
}

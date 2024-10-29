import React from 'react';

export default async function EmailConfirmationPage({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  const { email } = searchParams;
  return (
    <div className="mx-auto">
      <h1>{`We have sent an email to ${email} to confirm your address`}</h1>
    </div>
  );
}
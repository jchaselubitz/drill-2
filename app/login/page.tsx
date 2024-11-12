import LoginForm from './(components)/login_form';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string; token: string }>;
}) {
  const { token, message } = await searchParams;

  return (
    <div className="animate-in mt-20 md:mt-72 flex flex-col w-full px-8 sm:max-w-md justify-center">
      <LoginForm message={message} token={token} />
    </div>
  );
}

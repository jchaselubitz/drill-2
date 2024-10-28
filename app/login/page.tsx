import LoginForm from './(components)/login_form';

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string; token: string };
}) {
  const token = searchParams.token;

  return (
    <div className="animate-in mt-20 md:mt-72 flex flex-col w-full px-8 sm:max-w-md justify-center">
      <LoginForm message={searchParams.message} token={token} />
    </div>
  );
}

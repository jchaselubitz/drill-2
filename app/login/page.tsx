import LoginBox from './(components)/login_box';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string; token: string; form: string }>;
}) {
  const { token, message, form } = await searchParams;

  return (
    <div className="animate-in mt-20 md:mt-72 flex flex-col w-full px-8 sm:max-w-md justify-center">
      <LoginBox token={token} message={message} form={form} />
    </div>
  );
}

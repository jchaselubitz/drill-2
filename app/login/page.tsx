import LoginBox from '@/components/login/login_box';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{
    message: string;
    token: string;
    form: string;
    error_description: string;
  }>;
}) {
  const { token, message: incomingMessage, form, error_description } = await searchParams;

  const message = incomingMessage ? incomingMessage : error_description ? error_description : '';
  return (
    <div className="flex flex-row h-screen w-full">
      <div className="animate-in  flex flex-col items-center justify-center w-full">
        <LoginBox token={token} message={message} form={form} />
      </div>
    </div>
  );
}

import LoginBox from './(components)/login_box';
import LoginMedia from './(components)/login_media';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string; token: string; form: string }>;
}) {
  const { token, message, form } = await searchParams;

  return (
    <div className="flex flex-row h-screen w-full">
      <div className="animate-in  flex flex-col items-center justify-center w-full">
        <LoginBox token={token} message={message} form={form} />
      </div>
      {/* <div className="bg-slate-100 col-span-2 w-full flex flex-col items-center justify-center">
        <LoginMedia />
      </div> */}
    </div>
  );
}

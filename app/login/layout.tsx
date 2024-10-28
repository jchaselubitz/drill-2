import BackButton from '@/components/back_button';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center ">
      <BackButton />
      {children}
    </div>
  );
}

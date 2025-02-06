import DeveloperPlug from '@/components/developer_plug';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center ">
      {children}
      <div className="absolute md:fixed bottom-10 md:bottom-20 ">
        <DeveloperPlug />
      </div>
    </div>
  );
}

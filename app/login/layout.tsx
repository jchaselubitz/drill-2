import DeveloperPlug from '@/components/developer_plug';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center ">
      {children}
      <div className="absolute sm:top-2 md:fixed md:bottom-20 ">
        <DeveloperPlug />
      </div>
    </div>
  );
}

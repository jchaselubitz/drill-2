import CaptureAudio from '@/components/capture_audio';
import CaptureText from '@/components/capture_text';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px]  justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {user && <CaptureAudio userId={user.id} />}
        {user && <CaptureText prefLanguage="de" />}
        <div className="flex flex-col items-center gap-4">Capture Image</div>
        <div className="flex flex-col items-center gap-4">Recent Content</div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}

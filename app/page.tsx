import Link from 'next/link';
import CaptureAudio from '@/components/capture_audio';
import CaptureText from '@/components/capture_text';
import PhraseCard from '@/components/phrases/phrase_card';
import { Button } from '@/components/ui/button';
import { getPhrases } from '@/lib/actions/phraseActions';
import { getProfile } from '@/lib/actions/userActions';

export default async function Home() {
  const phrases = await getPhrases('home');
  const profile = await getProfile();

  const recentPhrases = phrases.slice(0, 4);

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-8 md:items-center w-full">
        {profile && <CaptureAudio />}
        {profile && <CaptureText />}

        <div className="flex flex-col items-center gap-4 w-full">
          {recentPhrases.map((phrase: any) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
          {recentPhrases.length > 0 && (
            <Link href={'/library'}>
              <Button size={'lg'} variant={'link'} className="text-base">
                See all
              </Button>
            </Link>
          )}
        </div>
      </main>
      {/* <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer> */}
    </div>
  );
}

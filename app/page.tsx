import Link from 'next/link';
import CaptureAudio from '@/components/capture_audio';
import CaptureText from '@/components/capture_text';
import PhraseRecordingCardList from '@/components/phrasesAndRecordings/phrase_recording_list';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getPhrases } from '@/lib/actions/phraseActions';

export default async function Home() {
  const phrases = await getPhrases('home');
  const recentPhrases = phrases.slice(0, 6);

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-4 md:items-center w-full">
        <CaptureAudio />
        <CaptureText />
        {recentPhrases.length > 0 && (
          <div className="flex flex-col items-center justify-center">
            <Separator className="w-2/3" />
          </div>
        )}
        <div className="flex flex-col items-center gap-4 w-full">
          <PhraseRecordingCardList phrases={recentPhrases} />

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

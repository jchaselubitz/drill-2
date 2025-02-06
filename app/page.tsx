import { Youtube } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import CaptureAudio from '@/components/capture_audio';
import CaptureText from '@/components/capture_text';
import PhraseRecordingCardList from '@/components/phrasesAndRecordings/phrase_recording_list';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getPhrases } from '@/lib/actions/phraseActions';
import { DemoVideoURL } from '@/lib/helpers/helpersMarketing';

export default async function Home() {
  const phrases = await getPhrases({ source: 'home' });
  const recentPhrases = phrases.slice(0, 6);

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-4 pt-4 md:pt-0 md:items-center w-full ">
        <Suspense
          fallback={
            <div className="flex gap-3 items-center">
              <Skeleton className="rounded-full h-12 w-12" />
              <Skeleton className="rounded-full h-12 w-12" />
              <Skeleton className="rounded-full h-24 w-24" />
            </div>
          }
        >
          <CaptureAudio />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-20" />}>
          <CaptureText />
        </Suspense>
        {recentPhrases.length > 0 ? (
          <div className="flex flex-col items-center justify-center">
            <Separator className="w-2/3" />
          </div>
        ) : (
          <a
            href={DemoVideoURL}
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center gap-1 "
          >
            <Button size="lg" variant={'outline'}>
              <Youtube className="h-5 w-5" /> Watch the tutorial
            </Button>
          </a>
        )}

        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 w-full mt-4">
              {' '}
              <Skeleton className="w-full h-16" />
              <Skeleton className="w-full h-16" />{' '}
            </div>
          }
        >
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
        </Suspense>
      </main>
    </div>
  );
}

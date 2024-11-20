import Link from 'next/link';
import CaptureAudio from '@/components/capture_audio';
import CaptureText from '@/components/capture_text';

import { Button } from '@/components/ui/button';
import { getPhrases } from '@/lib/actions/phraseActions';
import { getProfile } from '@/lib/actions/userActions';
import { getRecordings } from '@/lib/actions/recordingActions';
import PhraseRecordingCardList from '@/components/phrasesAndRecordings/phrase_recording_list';

export default async function Home() {
  const phrases = await getPhrases('home');
  const recentPhrases = phrases.slice(0, 4);
  const recordings = await getRecordings({ num: 5 });
  const profile = await getProfile();

  const listLength = recentPhrases.length + recordings.length;

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-8 md:items-center w-full">
        {profile && <CaptureAudio />}
        {profile && <CaptureText />}

        <div className="flex flex-col items-center gap-4 w-full">
          <PhraseRecordingCardList phrases={recentPhrases} recordings={recordings} />

          {listLength > 0 && (
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

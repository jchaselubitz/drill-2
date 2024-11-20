import PhraseCard from '@/components/phrasesAndRecordings/phrase_card';

import { BaseRecording, PhraseWithTranslations } from 'kysely-codegen';
import RecordingCard from './recording_card';

export default function PhraseRecordingCardList({
  phrases,
  recordings,
}: {
  phrases: PhraseWithTranslations[];
  recordings: BaseRecording[];
}) {
  const phrasesList = phrases.map((phrase: PhraseWithTranslations) => ({
    datetime: phrase.createdAt,
    component: PhraseCard,
    props: { phrase },
  }));
  const recordingsList = recordings.map((recording: BaseRecording) => ({
    datetime: recording.createdAt,
    component: RecordingCard,
    props: { recording },
  }));
  const jointList = [...phrasesList, ...recordingsList].sort(
    (a, b) => b.datetime.getTime() - a.datetime.getTime()
  );
  return (
    <>
      {jointList.map((item) => {
        const Component = item.component;
        return <Component key={item.datetime.getTime()} {...(item.props as any)} />;
      })}
    </>
  );
}

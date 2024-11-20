import { PhraseWithTranslations } from 'kysely-codegen';
import PhraseCard from '@/components/phrasesAndRecordings/phrase_card';

import RecordingCard from './recording_card';

export default function PhraseRecordingCardList({
  phrases,
}: {
  phrases: PhraseWithTranslations[];
}) {
  const phrasesList = phrases.map((phrase: PhraseWithTranslations) => ({
    datetime: phrase.createdAt,
    component: phrase.type === 'recording' ? RecordingCard : PhraseCard,
    props: { phrase },
  }));

  return (
    <>
      {phrasesList.map((item) => {
        const Component = item.component;
        return <Component key={item.datetime.getTime()} {...(item.props as any)} />;
      })}
    </>
  );
}

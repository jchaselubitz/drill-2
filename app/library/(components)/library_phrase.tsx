import { PhraseWithAssociations } from 'kysely-codegen';
import React from 'react';
import TtsButton from '@/components/ai_elements/tts_button';
import PhraseCardDetails from '@/components/phrasesAndRecordings/phrase_card_details';
import TagList from '@/components/tags/tag_list';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon } from '@/lib/lists';

interface LibraryPhraseProps {
  phrase: PhraseWithAssociations;
  isMobile: boolean;
  setOptPhraseData: (data: any) => void;
  userTags: string[];
  setSelectedPhraseId: (id: string) => void;
}

const LibraryPhrase: React.FC<LibraryPhraseProps> = ({
  phrase,
  isMobile,
  setOptPhraseData,
  userTags,
  setSelectedPhraseId,
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between font-bold mb-3">
        {phrase.text}{' '}
        {isMobile && <TtsButton text={phrase.text} bucket="text_to_speech" lacksAudio={false} />}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col w-full mb-3 p-1 text-xs font-medium">
          <div>Created: {getHumanDate(phrase.createdAt)}</div>
          <div>Language: {getLangIcon(phrase.lang)}</div>
          {phrase.source && <div>Source: {phrase.source}</div>}
        </div>
        <TagList phrase={phrase} setOptPhraseData={setOptPhraseData} userTags={userTags} />
      </div>
      <PhraseCardDetails phrase={phrase} setSelectedPhraseId={setSelectedPhraseId} />
    </div>
  );
};

export default LibraryPhrase;

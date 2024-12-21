import { PhraseWithAssociations } from 'kysely-codegen';
import TtsButton from '@/components/ai_elements/tts_button';
import PhraseCardDetails from '@/components/phrasesAndRecordings/phrase_card_details';
import TagList from '@/components/tags/tag_list';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon } from '@/lib/lists';

import LibraryPhraseTopBar from './library_phrase_top_bar';

interface LibraryPhrasePanelProps {
  phrase: PhraseWithAssociations | null;
  userTags: string[];
}

const LibraryPhrasePanel: React.FC<LibraryPhrasePanelProps> = ({ phrase, userTags }) => {
  if (!phrase)
    return (
      <div className="flex h-svh items-center justify-center p-6 w-full">
        <div className="text-center">Select a phrase to view details</div>
      </div>
    );

  return (
    <div className="relative flex flex-col w-full h-full z-30 bg-white overflow-y-scroll">
      <LibraryPhraseTopBar phrase={phrase} userTags={userTags} />
      <div className=" flex flex-col p-4 border-b border-slate-200 gap-3  ">
        <div className="flex justify-between ">
          <div className="flex gap-3 font-bold items-start">
            <TtsButton text={phrase.text} bucket="text_to_speech" lacksAudio={false} />{' '}
            <div className="mt-2">{phrase.text}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col w-full mb-3  text-xs font-medium">
            <div>Created: {getHumanDate(phrase.createdAt)}</div>
            <div>Language: {getLangIcon(phrase.lang)}</div>
            {phrase.source && <div>Source: {phrase.source}</div>}
          </div>
          <TagList phrase={phrase} userTags={userTags} />
        </div>
      </div>

      <PhraseCardDetails phrase={phrase} />
    </div>
  );
};

export default LibraryPhrasePanel;

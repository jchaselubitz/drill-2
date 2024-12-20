import { PhraseWithAssociations } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import TtsButton from '@/components/ai_elements/tts_button';
import PhraseCardDetails from '@/components/phrasesAndRecordings/phrase_card_details';
import TagList from '@/components/tags/tag_list';
import { Button } from '@/components/ui/button';
import { useLibraryContext } from '@/contexts/library_context';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon } from '@/lib/lists';

import LibraryPhraseTopBar from './library_phrase_top_bar';

interface LibraryPhrasePanelProps {
  phrase: PhraseWithAssociations | null;
  userTags: string[];
  setOptPhraseData: (data: any) => void;
}

const LibraryPhrasePanel: React.FC<LibraryPhrasePanelProps> = ({
  phrase,
  userTags,
  setOptPhraseData,
}) => {
  if (!phrase)
    return (
      <div className="flex h-svh items-center justify-center p-6 w-full">
        <div className="text-center">Select a phrase to view details</div>
      </div>
    );

  return (
    <div className="flex flex-col w-full h-full z-30 bg-white">
      <LibraryPhraseTopBar phraseId={phrase.id} />
      <div className="flex flex-col p-4 border-b border-slate-200 gap-3 overflow-y-scroll">
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
          <TagList phrase={phrase} setOptPhraseData={setOptPhraseData} userTags={userTags} />
        </div>
      </div>

      <PhraseCardDetails phrase={phrase} />
    </div>
  );
};

export default LibraryPhrasePanel;

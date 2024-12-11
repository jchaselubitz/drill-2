import { PhraseWithAssociations } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import TtsButton from '@/components/ai_elements/tts_button';
import PhraseCardDetails from '@/components/phrasesAndRecordings/phrase_card_details';
import TagList from '@/components/tags/tag_list';
import { Button } from '@/components/ui/button';
import { getHumanDate } from '@/lib/helpers/helpersDate';
import { getLangIcon } from '@/lib/lists';

interface LibraryPhrasePanelProps {
  phrase: PhraseWithAssociations;
  userTags: string[];
  setOptPhraseData: (data: any) => void;
  setSelectedPhraseId: (id: string | null) => void;
}

const LibraryPhrasePanel: React.FC<LibraryPhrasePanelProps> = ({
  phrase,

  userTags,

  setOptPhraseData,
  setSelectedPhraseId,
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col p-4 border-b border-slate-200 gap-3">
        <div className="flex justify-between ">
          <div className="flex gap-3 font-bold items-start">
            <TtsButton text={phrase.text} bucket="text_to_speech" lacksAudio={false} />{' '}
            <div className="mt-2">{phrase.text}</div>
          </div>
          <Button variant={'ghost'} size={'icon'} onClick={() => setSelectedPhraseId(null)}>
            <XIcon />{' '}
          </Button>
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

      <PhraseCardDetails phrase={phrase} setSelectedPhraseId={setSelectedPhraseId} />
    </div>
  );
};

export default LibraryPhrasePanel;

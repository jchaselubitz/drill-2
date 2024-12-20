import { Trash, XIcon } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLibraryContext } from '@/contexts/library_context';
import { deletePhrase } from '@/lib/actions/phraseActions';

type LibraryPhraseTopBarProps = {
  phraseId: string;
};

const LibraryPhraseTopBar: React.FC<LibraryPhraseTopBarProps> = ({ phraseId }) => {
  const { setSelectedPhraseId } = useLibraryContext();
  const handleDelete = async () => {
    confirm('Are you sure you want to delete this phrase?');
    await deletePhrase(phraseId);
  };
  return (
    <div className=" z-30 flex w-full items-center justify-between h-14 px-4 border-b border-slate-200">
      <div>
        <Button className="text-red-600" variant={'ghost'} size="icon" onClick={handleDelete}>
          <Trash color="red" />
        </Button>
      </div>
      <Button variant={'ghost'} size={'icon'} onClick={() => setSelectedPhraseId(null)}>
        <XIcon />{' '}
      </Button>
    </div>
  );
};

export default LibraryPhraseTopBar;

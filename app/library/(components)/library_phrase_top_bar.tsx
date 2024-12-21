import { StarFilledIcon } from '@radix-ui/react-icons';
import { PhraseWithAssociations } from 'kysely-codegen';
import { StarIcon, Tag, Trash, XIcon } from 'lucide-react';
import React, { startTransition, useOptimistic } from 'react';
import TagList from '@/components/tags/tag_list';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLibraryContext } from '@/contexts/library_context';
import { deletePhrase } from '@/lib/actions/phraseActions';
import { togglePhraseFavorite } from '@/lib/actions/phraseActions';

type LibraryPhraseTopBarProps = {
  phrase: PhraseWithAssociations;
  userTags: string[];
};

const LibraryPhraseTopBar: React.FC<LibraryPhraseTopBarProps> = ({ phrase, userTags }) => {
  const { setSelectedPhraseId } = useLibraryContext();

  const handleDelete = async () => {
    confirm('Are you sure you want to delete this phrase?');
    await deletePhrase(phrase.id);
  };

  const [optPhraseData, setOptPhraseData] = useOptimistic<
    PhraseWithAssociations,
    PhraseWithAssociations
  >(phrase, (state, updatedPhrase) => {
    return {
      ...state,
      ...updatedPhrase,
    };
  });

  const toggleFavorite = () => {
    startTransition(() => {
      setOptPhraseData({ ...optPhraseData, favorite: !optPhraseData.favorite });
    });
    togglePhraseFavorite({
      phraseId: phrase.id,
      isFavorite: phrase.favorite,
    });
  };

  return (
    <div className="sticky top-0 z-30 flex w-full justify-between items-center min-h-14 px-4 border-b border-slate-200 bg-white">
      <div>
        <Button variant={'ghost'} size="icon" onClick={handleDelete}>
          <Trash color="#b91c1c" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'ghost'} size="icon">
              <Tag />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 p-2 pt-4">
            <TagList phrase={phrase} setOptPhraseData={setOptPhraseData} userTags={userTags} />
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant={'ghost'} size="icon" onClick={toggleFavorite}>
          {optPhraseData.favorite ? <StarFilledIcon color="black" /> : <StarIcon />}
        </Button>
      </div>
      <Button variant={'ghost'} size={'icon'} onClick={() => setSelectedPhraseId(null)}>
        <XIcon />
      </Button>
    </div>
  );
};

export default LibraryPhraseTopBar;

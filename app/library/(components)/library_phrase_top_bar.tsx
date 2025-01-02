import { StarFilledIcon } from '@radix-ui/react-icons';
import { PhraseType, PhraseWithAssociations } from 'kysely-codegen';
import { ChevronDown, StarIcon, Tag, Trash, XIcon } from 'lucide-react';
import React, { startTransition, useOptimistic } from 'react';
import TagList from '@/components/tags/tag_list';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLibraryContext } from '@/contexts/library_context';
import {
  deletePhrase,
  updatePhrasePartSpeech,
  updatePhraseType,
} from '@/lib/actions/phraseActions';
import { togglePhraseFavorite } from '@/lib/actions/phraseActions';
import {
  getPhraseTypeIcon,
  getPhraseTypeName,
  getPosTypeIcon,
  getPosTypeName,
  PhraseListType,
  PhraseTypes,
  PosTypes,
} from '@/lib/lists';

type LibraryPhraseTopBarProps = {
  phrase: PhraseWithAssociations;
  userTags: string[];
};

const LibraryPhraseTopBar: React.FC<LibraryPhraseTopBarProps> = ({ phrase, userTags }) => {
  const { setSelectedPhraseId } = useLibraryContext();

  const [optPhraseData, setOptPhraseData] = useOptimistic<
    PhraseWithAssociations,
    PhraseWithAssociations
  >(phrase, (state, updatedPhrase) => {
    return {
      ...state,
      ...updatedPhrase,
    };
  });

  const handleSetType = (type: PhraseType) => {
    startTransition(() => {
      setOptPhraseData({ ...optPhraseData, type: type });
    });
    updatePhraseType({ phraseId: phrase.id, type });
  };

  const handleSetPos = (pos: string) => {
    startTransition(() => {
      setOptPhraseData({ ...optPhraseData, partSpeech: pos });
    });
    updatePhrasePartSpeech({ phraseId: phrase.id, partSpeech: pos });
  };

  const handleDelete = async () => {
    confirm('Are you sure you want to delete this phrase?');
    await deletePhrase(phrase.id);
  };

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
      <div className="flex items-center gap-2">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {!phrase.type ? 'Type' : getPhraseTypeIcon(phrase.type)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {PhraseTypes.map((type: PhraseListType) => {
              return (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  className="capitalize flex items-center gap-3 justify-between"
                  checked={phrase.type === type.value}
                  onCheckedChange={() => handleSetType(type.value)}
                >
                  {getPhraseTypeName(type.value)}
                  {type.value && getPhraseTypeIcon(type.value, 18)}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {!phrase.partSpeech ? 'Pos' : getPosTypeIcon(phrase.partSpeech)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {PosTypes.map((type) => {
              return (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  className="capitalize flex items-center gap-3 justify-between"
                  checked={phrase.partSpeech === type.value}
                  onCheckedChange={() => handleSetPos(type.value)}
                >
                  {getPosTypeName(type.value)}
                  {/* {type.value && getPosTypeIcon(type.value, 18)} */}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button variant={'ghost'} size={'icon'} onClick={() => setSelectedPhraseId(null)}>
        <XIcon />
      </Button>
    </div>
  );
};

export default LibraryPhraseTopBar;

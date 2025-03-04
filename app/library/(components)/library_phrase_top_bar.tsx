import { StarFilledIcon } from '@radix-ui/react-icons';
import { Iso639LanguageCode, PhraseType, PhraseWithAssociations } from 'kysely-codegen';
import { Languages, StarIcon, Tag, Trash, XIcon } from 'lucide-react';
import React, { startTransition, useOptimistic } from 'react';
import LanguageMenu from '@/components/selectors/language_selector';
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
  updatePhraseLang,
  updatePhrasePartSpeech,
  updatePhraseType,
} from '@/lib/actions/phraseActions';
import { togglePhraseFavorite } from '@/lib/actions/phraseActions';
import {
  getLangIcon,
  getPartSpeechTypeIcon,
  getPartSpeechTypeName,
  getPhraseTypeIcon,
  getPhraseTypeName,
  PartSpeechTypes,
  PhraseListType,
  PhraseTypes,
} from '@/lib/lists';

type LibraryPhraseTopBarProps = {
  phrase: PhraseWithAssociations;
  userTags: string[];
};

const LibraryPhraseTopBar: React.FC<LibraryPhraseTopBarProps> = ({ phrase, userTags }) => {
  const { setSelectedPhrasePage } = useLibraryContext();

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

  const handleChangeLang = async ({ lang }: { lang: Iso639LanguageCode; name: string }) => {
    startTransition(() => {
      setOptPhraseData({ ...optPhraseData, lang });
    });
    await updatePhraseLang({ phraseId: phrase.id, lang });
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
              {!phrase.partSpeech ? 'Pos' : getPartSpeechTypeIcon(phrase.partSpeech)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {PartSpeechTypes.map((type) => {
              return (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  className="capitalize flex items-center gap-3 justify-between"
                  checked={phrase.partSpeech === type.value}
                  onCheckedChange={() => handleSetPos(type.value)}
                >
                  {getPartSpeechTypeName(type.value)}
                  {/* {type.value && getPartSpeechTypeIcon(type.value, 18)} */}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        {phrase.translations.length === 0 ? (
          <LanguageMenu
            props={{
              icon: Languages,
              label: <Languages />,
              name: '',
              language: phrase.lang,
            }}
            iconOnly
            borderZero
            automaticOption
            onClick={handleChangeLang}
          />
        ) : (
          <div className="flex items-center ml-4 opacity-50">{getLangIcon(phrase.lang)}</div>
        )}
      </div>
      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => setSelectedPhrasePage({ phraseId: null })}
      >
        <XIcon />
      </Button>
    </div>
  );
};

export default LibraryPhraseTopBar;

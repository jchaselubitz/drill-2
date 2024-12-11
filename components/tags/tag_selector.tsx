import { BaseTag, PhraseWithAssociations } from 'kysely-codegen';
import { Plus } from 'lucide-react';
import { startTransition, useState } from 'react';
import { addPhraseTags } from '@/lib/actions/phraseActions';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TagListProps {
  phrase: PhraseWithAssociations;
  userTags: string[];
  setOptPhraseData: (action: PhraseWithAssociations) => void;
}

export default function TagSelector({ phrase, userTags, setOptPhraseData }: TagListProps) {
  const { id: phraseId, tags } = phrase;
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const hasInputValue = inputValue.trim().length > 0;

  const showMatchingTags = () => {
    if (!hasInputValue) return [];
    return userTags
      .filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 8);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const submitTags = async () => {
    if (!hasInputValue) return;

    const newTagsInput = inputValue
      .split(',')
      .map((tag) => tag.toLowerCase().trim())
      .filter((tag) => tag.length > 0);

    const filteredTags = newTagsInput.filter((newTag) => !tags.some((t) => t.label === newTag));

    if (filteredTags.length > 0) {
      const placeholderTags = filteredTags.map((tag) => ({
        label: tag,
        id: Math.random().toString(),
      })) as BaseTag[];

      startTransition(async () => {
        setOptPhraseData({ ...phrase, tags: [...tags, ...placeholderTags] });
        await addPhraseTags({ phraseId, tags: filteredTags });
      });

      setInputValue('');
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      await submitTags();
    }
  };

  return (
    <div
      className={cn(
        'relative z-0 flex gap-2 items-center justify-end focus:stroke-none',
        hasInputValue && 'shadow-md'
      )}
    >
      {!showInput ? (
        <Button onClick={() => setShowInput(true)} variant={'ghost'}>
          <Plus size={20} /> Add tag
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Input
              type="text"
              className="w-32"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Add tags, separate with commas"
              autoFocus
            />
            {hasInputValue && (
              <div
                className={cn(
                  'absolute z-10 top-8 border-b border-x rounded-md flex flex-col gap-1 bg-white  w-32  shadow-md'
                )}
              >
                {showMatchingTags().map((tag) => (
                  <Button
                    key={tag}
                    variant={'ghost'}
                    className="text-left justify-start"
                    onClick={() => {
                      setInputValue(tag);
                      submitTags();
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={() => {
              submitTags();
              setShowInput(false);
            }}
            variant={'default'}
            size="sm"
          >
            Add
          </Button>
          <Button variant={'outline'} size="sm" onClick={() => setShowInput(false)}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

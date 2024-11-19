import { startTransition, useState } from 'react';
import Tag from './tag';
import { addPhraseTags, removePhraseTag } from '@/lib/actions/phraseActions';
import { BaseTag, PhraseWithTranslations } from 'kysely-codegen';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Input } from '../ui/input';

interface TagListProps {
  phrase: PhraseWithTranslations;
  setOptPhraseData: (action: PhraseWithTranslations) => void;
}

export default function TagList({ phrase, setOptPhraseData }: TagListProps) {
  const { id: phraseId, tags } = phrase;
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const submitTags = async () => {
    if (!inputValue.trim()) return;

    const newTags = inputValue
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (newTags.length > 0) {
      const placeholderTags = newTags.map((tag, i) => ({
        label: tag,
        id: Math.random().toString(),
      })) as BaseTag[];

      startTransition(async () => {
        await addPhraseTags({ phraseId, tags: newTags });
        setOptPhraseData({ ...phrase, tags: [...tags, ...placeholderTags] });
      });

      setInputValue('');
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const placeholderTags = tags.filter((tag) => tag.id !== tagId);
    startTransition(() => {
      setOptPhraseData({ ...phrase, tags: placeholderTags });
    });
    await removePhraseTag({ phraseId, tagId });
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      await submitTags();
    }
  };

  return (
    <div className="flex gap-2 items-center w-full justify-end ">
      <div className="flex flex-wrap gap-2 items-center ">
        {tags.map((tag) => (
          <Tag key={tag.id} label={tag.label} onRemove={() => handleRemoveTag(tag.id)} />
        ))}
      </div>
      {!showInput ? (
        <Button onClick={() => setShowInput(true)} variant={'ghost'}>
          <Plus size={20} />
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="min-w-24"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add tags, separate with commas"
            autoFocus
          />
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
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

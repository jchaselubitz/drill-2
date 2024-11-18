import { useState } from 'react';
import Tag from './tag';
import { addPhraseTags, removePhraseTag } from '@/lib/actions/phraseActions';
import { BaseTag } from 'kysely-codegen';

interface TagListProps {
  tags: BaseTag[];
  phraseId: string;
}

export default function TagList({ phraseId, tags }: TagListProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      await submitTags();
    }
  };

  const submitTags = async () => {
    if (!inputValue.trim()) return;

    const newTags = inputValue
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (newTags.length > 0) {
      await addPhraseTags({ phraseId, tags: newTags });
      setInputValue('');
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    await removePhraseTag({ phraseId, tagId });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag: BaseTag) => (
        <Tag key={tag.id} label={tag.label} onRemove={() => handleRemoveTag(tag.id)} />
      ))}

      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="px-2 py-1 text-sm border rounded-md hover:bg-gray-50"
        >
          + Add Tag
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add tags, separate with commas"
            className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => {
              submitTags();
              setShowInput(false);
            }}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-2 py-1 text-sm border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

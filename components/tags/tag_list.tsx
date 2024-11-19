import { PhraseWithTranslations } from 'kysely-codegen';
import { startTransition } from 'react';
import { removePhraseTag } from '@/lib/actions/phraseActions';

import Tag from './tag';
import TagSelector from './tag_selector';

interface TagListProps {
  phrase: PhraseWithTranslations;
  userTags?: string[];
  setOptPhraseData?: (action: PhraseWithTranslations) => void;
}

export default function TagList({ phrase, userTags, setOptPhraseData }: TagListProps) {
  const { id: phraseId, tags } = phrase;

  const handleRemoveTag = async (tagId: string) => {
    if (!setOptPhraseData) return;
    const placeholderTags = tags.filter((tag) => tag.id !== tagId);
    startTransition(() => {
      setOptPhraseData({ ...phrase, tags: placeholderTags });
    });
    await removePhraseTag({ phraseId, tagId });
  };

  return (
    <div className="flex gap-2 items-center w-full justify-end ">
      <div className="flex flex-wrap gap-2 items-center ">
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            label={tag.label}
            onRemove={setOptPhraseData ? () => handleRemoveTag(tag.id) : undefined}
          />
        ))}
      </div>
      {!!setOptPhraseData && userTags && (
        <TagSelector userTags={userTags} phrase={phrase} setOptPhraseData={setOptPhraseData} />
      )}
    </div>
  );
}

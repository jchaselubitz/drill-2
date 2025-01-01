import React, { useState } from 'react';
import { addPhrase } from '@/lib/actions/phraseActions';
import { getPhraseType } from '@/lib/helpers/helpersPhrase';
import { LanguagesISO639 } from '@/lib/lists';

import { Button } from '../ui/button';

interface NestedListItemProps {
  value: any;
  parentKeys: string[];
  source: string | undefined;
  lang: LanguagesISO639;
  associatedPhraseId: string | undefined;
}

const NestedListItem: React.FC<NestedListItemProps> = ({
  value,
  source,
  lang,
  associatedPhraseId,
}) => {
  const [saved, setSaved] = useState(false);

  const saveContent = async (content: string): Promise<boolean> => {
    try {
      await addPhrase({
        source,
        text: content.trim(),
        lang,
        type: getPhraseType(content.trim()),
        associationId: associatedPhraseId,
      });
    } catch (error) {
      throw Error(`Error saving content: ${error}`);
    }
    return true;
  };

  const handleSave = async (content: string) => {
    const success = await saveContent(content);
    if (success) {
      setSaved(true);
    }
  };

  return (
    <div className="flex w-full gap-3 items-center justify-between border border-gray-300 rounded p-2 hover:bg-gray-100">
      <span>{value}</span>

      <Button disabled={saved} onClick={() => handleSave(value)}>
        {saved ? 'Saved' : 'Save'}
      </Button>
    </div>
  );
};

export default NestedListItem;

import { Iso639LanguageCode } from 'kysely-codegen';
import React, { useState } from 'react';
import { addPhrase } from '@/lib/actions/phraseActions';
import { getPhraseType } from '@/lib/helpers/helpersPhrase';
import { SourceOptionType } from '@/lib/lists';

import { ButtonLoadingState, LoadingButton } from '../ui/button-loading';

interface NestedListItemProps {
  value: any;
  parentKeys: string[];
  source: SourceOptionType;
  lang: Iso639LanguageCode;
  associatedPhraseId: string | undefined;
}

const NestedListItem: React.FC<NestedListItemProps> = ({
  value,
  source,
  lang,
  associatedPhraseId,
}) => {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');

  const handleSave = async (content: string) => {
    setButtonState('loading');
    try {
      await addPhrase({
        source,
        text: content.trim(),
        lang,
        type: getPhraseType(content.trim()),
        associationId: associatedPhraseId,
      });
      setButtonState('success');
    } catch (error) {
      if (`${error}`.includes('unique_phrase_user_lang')) {
        alert('Phrase already exists');
        setButtonState('success');
        return;
      }
      setButtonState('error');
    }
  };

  return (
    <div className="flex w-full gap-3 items-center justify-between border border-gray-300 rounded p-2 hover:bg-gray-100">
      <span>{value}</span>

      <LoadingButton
        onClick={() => handleSave(value)}
        buttonState={buttonState}
        text={'save'}
        errorText="Error"
      />
    </div>
  );
};

export default NestedListItem;

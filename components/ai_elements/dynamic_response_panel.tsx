import { usePathname } from 'next/navigation';
import React from 'react';
import { addTranslation } from '@/lib/actions/phraseActions';
import { GenResponseType, TranslationResponseType } from '@/lib/aiGenerators/types_generation';
import { LanguagesISO639 } from '@/lib/lists';

import NestedObject from './nested_object';
import SaveTranslationButton from './save_translation_button';

interface DynamicResponsePanelProps {
  genResponse: GenResponseType;
  associatedPhraseId?: string;
  lang: LanguagesISO639;
  primaryPhraseIds: string[];
  source: string | undefined;
}

const DynamicResponsePanel: React.FC<DynamicResponsePanelProps> = ({
  genResponse,
  primaryPhraseIds,
  lang,
  associatedPhraseId,
  source,
}) => {
  const pathname = usePathname();
  const arePrimaryPhrases = primaryPhraseIds && primaryPhraseIds.length > 0 ? true : false;

  const saveTranslation = async () => {
    if (!genResponse) {
      throw Error('No genResponse');
    }

    if (arePrimaryPhrases) {
      await addTranslation({
        primaryPhraseIds,
        genResponse: genResponse.data as TranslationResponseType,
        source,
        revalidationPath: { path: pathname },
      });
    }
  };

  return genResponse.type === 'translation' ? (
    <div className="">
      <SaveTranslationButton data={genResponse.data} saveTranslation={saveTranslation} />
    </div>
  ) : (
    genResponse.type !== 'explanation' && (
      <div className="">
        <NestedObject
          data={genResponse.data}
          lang={lang}
          source={source}
          associatedPhraseId={associatedPhraseId}
        />
      </div>
    )
  );
};

export default DynamicResponsePanel;

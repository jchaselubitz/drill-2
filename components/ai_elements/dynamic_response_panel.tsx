import { Iso639LanguageCode, PhraseType } from 'kysely-codegen';
import { usePathname } from 'next/navigation';
import React from 'react';
import { addTranslation } from '@/lib/actions/phraseActions';
import { GenResponseType, TranslationResponseType } from '@/lib/aiGenerators/types_generation';
import { SourceOptionType } from '@/lib/lists';

import NestedObject from './nested_object';
import SaveTranslationButton from './save_translation_button';

interface DynamicResponsePanelProps {
  genResponse: GenResponseType;
  associatedPhraseId?: string;
  lang: Iso639LanguageCode;
  primaryPhraseIds: string[];
  source: SourceOptionType;
  phraseType?: PhraseType;
  className?: string;
}

const DynamicResponsePanel: React.FC<DynamicResponsePanelProps> = ({
  genResponse,
  primaryPhraseIds,
  lang,
  associatedPhraseId,
  source,
  phraseType,
  className,
}) => {
  const pathname = usePathname();

  const saveTranslation = async () => {
    if (!genResponse) {
      throw Error('No genResponse');
    }

    await addTranslation({
      primaryPhraseIds,
      genResponse: genResponse.data as TranslationResponseType,
      source,
      phraseType,
      revalidationPath: { path: pathname },
    });
  };

  return genResponse.type === 'translation' ? (
    <div>
      <SaveTranslationButton data={genResponse.data} saveTranslation={saveTranslation} />
    </div>
  ) : (
    genResponse.type !== 'explanation' && (
      <div className={className}>
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

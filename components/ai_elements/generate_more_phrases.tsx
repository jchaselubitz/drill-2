import { Iso639LanguageCode, TranslationWithPhrase } from 'kysely-codegen';
import React, { useState } from 'react';
import { addPhrasesToLesson } from '@/lib/actions/lessonActions';
import { handleGeneratePhrases } from '@/lib/aiGenerators/generators_content';

import { LoadingButton } from '../ui/button-loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface GenerateMorePhrasesProps {
  lessonId: string;
  lessonTitle: string;
  studyLanguage: Iso639LanguageCode;
  userLanguage: Iso639LanguageCode;
  currentLevel: string | null;
  hasPhrases: boolean;
  examples: (TranslationWithPhrase | undefined)[] | undefined;
}

const GenerateMorePhrases: React.FC<GenerateMorePhrasesProps> = ({
  lessonId,
  lessonTitle,
  studyLanguage,
  userLanguage,
  currentLevel,
  hasPhrases,
  examples,
}) => {
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'error'>('default');
  const [isSentences, setIsSentences] = useState<boolean | undefined>(undefined);

  const handleGenerate = async () => {
    setButtonState('loading');
    const phraseArray = await handleGeneratePhrases({
      concept: lessonTitle,
      studyLanguage,
      userLanguage,
      level: currentLevel,
      examples,
      isSentences,
    });
    if (!phraseArray) {
      setButtonState('error');
      return;
    }
    setIsSentences(undefined);
    await addPhrasesToLesson({
      phrases: phraseArray,
      lessonId: lessonId,
    });
    setButtonState('default');
  };

  const showButton = hasPhrases || isSentences !== undefined;
  return (
    <div className="w-full flex gap-4">
      {!hasPhrases && (
        <div className="w-full">
          <Select onValueChange={(v) => setIsSentences(v === 'true')}>
            <SelectTrigger>
              <SelectValue placeholder="Choose type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Create sentences</SelectItem>
              <SelectItem value="false">Create words</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {showButton && (
        <LoadingButton
          variant={'outline'}
          size={'lg'}
          className="w-full  border-2 border-blue-600 rounded-lg text-blue-600 font-medium p-2"
          buttonState={buttonState}
          text={
            hasPhrases
              ? 'Generate more phrases'
              : `Generate ${isSentences ? 'phrases' : 'words'} from title`
          }
          loadingText="Generating..."
          errorText="Error generating phrases"
          onClick={handleGenerate}
        />
      )}
    </div>
  );
};

export default GenerateMorePhrases;

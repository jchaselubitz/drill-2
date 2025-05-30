'use client';

import { Iso639LanguageCode, TutorTopicWithCorrections } from 'kysely-codegen';
import React, { useState } from 'react';
import { AILoadingButton } from '@/components/specialButtons/ai_button';
import { ButtonLoadingState } from '@/components/ui/button-loading';
import { useTutorContext } from '@/contexts/tutor_context';
import { useUserContext } from '@/contexts/user_context';
import { saveTopicPrompt } from '@/lib/actions/tutorActions';
import { generateTutorPrompt } from '@/lib/aiGenerators/generators_tutor';
import { cn } from '@/lib/utils';

interface TopicPromptFormProps {
  topic: TutorTopicWithCorrections;
  relevantPhrases: any;
  promptsLength: number;
}

const TopicPromptForm: React.FC<TopicPromptFormProps> = ({
  topic,
  relevantPhrases,
  promptsLength,
}) => {
  const { setSelectedPromptAndCorrection } = useTutorContext();
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const { id: topicId, lang: topicLanguage, level, instructions } = topic;
  const { userLanguage, prefLanguage } = useUserContext();

  const preparedPhrases = relevantPhrases.map((phrase: any) => phrase.text);

  const handleSetNewPrompt = async () => {
    setButtonState('loading');
    if (!userLanguage || !topicLanguage || !level || !instructions) {
      alert('Missing information. Please try again.');
      return;
    }
    try {
      const newPrompt = await generateTutorPrompt({
        relatedPhraseArray: JSON.stringify(preparedPhrases),
        userLanguage,
        topicLanguage: (topicLanguage as Iso639LanguageCode) ?? prefLanguage,
        level,
        instructions,
      });
      const promptId = await saveTopicPrompt({ topicId, newPrompt });
      if (promptId) {
        setSelectedPromptAndCorrection({ promptId, correctionId: null });
        setButtonState('default');
      }
    } catch (error: any) {
      setButtonState('error');
      throw new Error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col mt-4 w-full">
      <div className="relative flex flex-col pb-6">
        <div className="flex justify-end gap-2 mt-2">
          <AILoadingButton
            onClick={handleSetNewPrompt}
            className={cn('w-fit bg-gradient-to-r from-blue-600 to-cyan-600')}
            buttonState={buttonState}
            text={promptsLength > 0 ? 'Generate another prompt' : 'Generate prompt'}
            loadingText={'Generating ...'}
            errorText="Something went wrong"
          />
        </div>
      </div>
    </div>
  );
};

export default TopicPromptForm;

const TestPrompt =
  'Write a short paragraph about the importance of personal conversations in building relationships. Include your thoughts on how they can help us understand each other better.';

// Anna ist eine teenager im Gymnasium. Sie vergessen immer, ihre Hände zu wachen. Ihre Freunde denken, dass das ist sehr furchbar, und sie sie tease.

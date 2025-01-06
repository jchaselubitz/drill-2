import { Iso639LanguageCode, PhraseType } from 'kysely-codegen';
import { Stars } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useChatContext } from '@/contexts/chat_window_context';
import { useUserContext } from '@/contexts/user_context';
import {
  generateNestedList,
  generateTranslation,
  genericContentRequest,
} from '@/lib/aiGenerators/generators_content';
import { generateExplanation } from '@/lib/aiGenerators/generators_tutor';
import { GenResponseType } from '@/lib/aiGenerators/types_generation';
import { handleReturnKeyPress } from '@/lib/helpers/helpersGeneral';
import { cn } from '@/lib/utils';

import { LoadingButton } from '../ui/button-loading';
import { Textarea } from '../ui/textarea';
import DynamicResponsePanel from './dynamic_response_panel';
import LightSuggestionList from './suggestions/light_suggestion_list';

interface ContentRequestProps {
  text: string | null;
  lang: Iso639LanguageCode;
  userId: string | undefined;
  phraseId: string;
  phraseType?: PhraseType;
  primaryPhraseIds: string[];
  suggestions: string[];
  source: string;
}

const ContentRequest: React.FC<ContentRequestProps> = ({
  text,
  lang,
  phraseId,
  phraseType,
  primaryPhraseIds,
  suggestions,
  source,
}) => {
  const { setChatOpen, setChatContext } = useChatContext();
  const { prefLanguage, userLanguage } = useUserContext();
  const arePrimaryPhrases = primaryPhraseIds && primaryPhraseIds.length > 0 ? true : false;

  const [genResponse, setGenResponse] = useState<GenResponseType | undefined>();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestText, setRequestText] = useState('');

  const firstWord = requestText.split(' ')[0];

  const endSession = () => {
    setRequestText('');
    setGenResponse(undefined);
  };

  useEffect(() => {
    if (requestText.length < 4) {
      setGenResponse(undefined);
    }
  }, [requestText, setGenResponse]);

  useEffect(() => {
    if (phraseId) {
      endSession();
    }
  }, [phraseId]);

  const setCommand = (firstWord: string) => {
    const word = firstWord ? firstWord[0].toUpperCase() + firstWord.slice(1) : '';
    //should I use a simple model to find words that are close to the command words?
    if (
      word === 'Explain' ||
      word === 'Why' ||
      word === 'How' ||
      word === 'Can' ||
      word === 'Summarize' ||
      word === 'Extract' ||
      word === 'Translate' ||
      word === 'List' ||
      word === 'Generate'
    ) {
      return word;
    }
  };

  const listRequested = setCommand(firstWord) === 'List' || setCommand(firstWord) === 'Extract';
  const translationRequested = setCommand(firstWord) === 'Translate' && arePrimaryPhrases;
  const explanationRequested =
    setCommand(firstWord) === 'Explain' ||
    setCommand(firstWord) === 'Why' ||
    setCommand(firstWord) === 'How' ||
    setCommand(firstWord) === 'Can';
  // setCommand(firstWord) === 'Summarize';

  const explanationActions = (explanation: string) => {
    setChatContext({
      matterText: text,
      requestText,
      assistantAnswer: explanation,
    });
    setChatOpen(true);
  };

  const handleRequest = async () => {
    setRequestLoading(true);

    if (!text) {
      setRequestLoading(false);
      return;
    }

    if (translationRequested) {
      try {
        const translation = await generateTranslation({
          subjectText: text,
          request: requestText,
          prefLanguage,
        });
        setGenResponse(translation);
        setRequestLoading(false);
        return;
      } catch (error) {
        console.error('Error generating translation:', error);
        setRequestLoading(false);
        return;
      }
    }

    if (explanationRequested) {
      try {
        const explanation = await generateExplanation({
          subjectText: text,
          request: requestText,
          userLanguage,
        });
        explanationActions(explanation.data);
        setRequestLoading(false);
        return;
      } catch (error) {
        console.error('Error generating explanation:', error);
        setRequestLoading(false);
        return;
      }
    }
    if (listRequested) {
      try {
        const list = await generateNestedList({ subjectText: text, request: requestText });
        setGenResponse(list);
        setRequestLoading(false);
        return;
      } catch (error) {
        console.error('Error generating list:', error);
        setRequestLoading(false);
        return;
      }
    } else {
      try {
        const resp = await genericContentRequest({
          subjectText: text,
          request: requestText,
        });
        if (resp.type === 'explanation') {
          explanationActions(resp.data);
          // }
          // if (resp.type === 'translation') {
          //   explanationActions(resp.data);
        } else {
          setGenResponse(resp);
        }
        setRequestLoading(false);
        return;
      } catch (error) {
        console.error('Error generating response:', error);
        setRequestLoading(false);
        return;
      }
    }
  };

  const setMaterialSuggestion = (suggestion: string) => {
    setRequestText(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleReturnKeyPress({ e, callBack: handleRequest });
  };

  const buttonText = explanationRequested ? (
    <div className="flex items-center gap-2">
      <Stars /> Explain in chat
    </div>
  ) : (
    (setCommand(firstWord) ?? 'Request')
  );
  return (
    <div className="relative flex flex-col gap-2 h-full">
      <div className="flex flex-col gap-3">
        <Textarea
          className="w-full"
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e)}
          placeholder="Make me 15 sentences using this word."
        />
        {/* {!genResponse ? ( */}
        <LoadingButton
          className={cn(
            'w-fit',
            explanationRequested && 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white '
          )}
          onClick={() => handleRequest()}
          text={buttonText}
          loadingText="Requesting"
          buttonState={requestLoading ? 'loading' : 'default'}
        />
      </div>

      {suggestions.length > 0 && requestText === '' && (
        <div className="mt-1">
          <LightSuggestionList
            suggestions={suggestions}
            setMaterialSuggestion={setMaterialSuggestion}
            isLoading={requestLoading}
            includeSuggestionCreator={false}
            handleGenerateLessonSuggestions={() => {}}
          />
        </div>
      )}

      {genResponse && (
        <DynamicResponsePanel
          primaryPhraseIds={primaryPhraseIds}
          genResponse={genResponse}
          lang={lang}
          associatedPhraseId={phraseId}
          source={source}
          phraseType={phraseType}
        />
      )}
    </div>
  );
};

export default ContentRequest;

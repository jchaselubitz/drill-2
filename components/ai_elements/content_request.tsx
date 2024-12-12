import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { addPhrase, addTranslation, GenResponseType } from '@/lib/actions/phraseActions';
import {
  getModelSelection,
  getOpenAiKey,
  gptFormatType,
  selectSystemMessage,
} from '@/lib/helpers/helpersAI';
import { getPhraseType } from '@/lib/helpers/helpersPhrase';
import { LanguagesISO639 } from '@/lib/lists';
import { createClient } from '@/utils/supabase/client';

import { LoadingButton } from '../ui/button-loading';
import { Textarea } from '../ui/textarea';
import NestedObject from './nested_object';
import PhraseChat, { ChatMessage } from './phrase_chat';
import SaveTranslationButton from './save_translation_button';
import LightSuggestionList from './suggestions/light_suggestion_list';

interface ContentRequestProps {
  text: string | null;
  lang: LanguagesISO639;
  userId: string | undefined;
  phraseId?: string;
  primaryPhraseIds?: string[];
  suggestions: string[];
  source: string;
}

const ContentRequest: React.FC<ContentRequestProps> = ({
  text,
  lang,
  userId,
  phraseId,
  primaryPhraseIds,
  suggestions,
  source,
}) => {
  const supabase = createClient();
  const pathname = usePathname();
  const [genResponse, setGenResponse] = useState<GenResponseType | undefined>();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[] | []>([]);
  const firstWord = requestText.split(' ')[0];

  const presentableMessages = chatMessages.filter((message) => message.role !== 'system').slice(2);

  useEffect(() => {
    if (requestText.length < 4) {
      setGenResponse(undefined);
    }
  }, [requestText, setGenResponse]);

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
  const isTranslation = setCommand(firstWord) === 'Translate' && primaryPhraseIds;
  const isExplanation =
    setCommand(firstWord) === 'Explain' ||
    setCommand(firstWord) === 'Why' ||
    setCommand(firstWord) === 'How' ||
    setCommand(firstWord) === 'Can';

  const chatIsLive = isExplanation && presentableMessages.length > 0;

  const captureCommand = () => {
    if (setCommand(firstWord)) {
      return { request: requestText, command: setCommand(firstWord) };
    }
    return { request: requestText, command: '' };
  };

  const handleRequest = async (newMessage?: string) => {
    setRequestLoading(true);
    const { request, command } = captureCommand();
    const modelParams = {
      format: 'json_object' as gptFormatType,
      max_tokens: 1000,
      temperature: 0.9,
    };

    let messages = [
      {
        role: 'system',
        content: selectSystemMessage(command, isExplanation),
      },
      { role: 'user', content: `text: ${text}` },
      { role: 'user', content: `request: ${request}` },
    ];

    if (isExplanation) {
      const formNewMessage = {
        role: 'user',
        content: newMessage ?? '',
      };

      messages =
        chatMessages.length < 1
          ? messages
          : formNewMessage
            ? [...chatMessages, formNewMessage]
            : chatMessages;

      setChatMessages(messages);
    }

    const { data, error } = await supabase.functions.invoke('gen-text', {
      body: {
        userApiKey: getOpenAiKey(),
        modelSelection: getModelSelection(),
        modelParams: modelParams,
        messages: messages,
      },
    });
    if (error) {
      setRequestLoading(false);
      throw Error('Error:', error);
    }
    try {
      const response = JSON.parse(data);
      setGenResponse(response);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response.explanation },
      ]);
      setRequestLoading(false);
    } catch (error) {
      alert('Sorry, it looks like the model returned the wrong format. Please try again.');
      setRequestLoading(false);
      throw Error('Error parsing JSON:', data);
    }
    setRequestLoading(false);
  };

  const saveContent = async (content: string): Promise<boolean> => {
    try {
      await addPhrase({
        source,
        text: content.trim(),
        lang,
        type: getPhraseType(text),
        associationId: phraseId,
      });
    } catch (error) {
      throw Error(`Error saving content: ${error}`);
    }
    return true;
  };

  const saveTranslation = async () => {
    if (!userId) {
      throw Error('No user ID');
    }
    if (!genResponse) {
      throw Error('No genResponse');
    }

    if (primaryPhraseIds && primaryPhraseIds.length !== 0) {
      await addTranslation({
        primaryPhraseIds,
        genResponse: {
          input_text: genResponse.input_text,
          input_lang: genResponse.input_lang,
          output_text: genResponse.output_text,
          output_lang: genResponse.output_lang,
        },
        source,
        revalidationPath: { path: pathname },
      });
    }
  };

  const setMaterialSuggestion = (suggestion: string) => {
    setRequestText(suggestion);
  };

  const endSession = () => {
    setRequestText('');
    setChatMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      handleRequest();
    }
  };

  return (
    <div className="relative flex flex-col gap-2 h-full">
      {!chatIsLive && (
        <>
          <Textarea
            className="w-full"
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="Make me 15 sentences using this word."
          />
          <LoadingButton
            className="w-fit"
            onClick={() => handleRequest()}
            onKeyDown={(e) => handleKeyPress(e)}
            text={setCommand(firstWord) ?? 'Request'}
            loadingText="Requesting"
            buttonState={requestLoading ? 'loading' : 'default'}
          />
        </>
      )}
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

      {genResponse &&
        (isTranslation ? (
          <div className="mt-5 ">
            <SaveTranslationButton
              input_text={genResponse.input_text}
              input_lang={genResponse.input_lang}
              output_text={genResponse.output_text}
              output_lang={genResponse.output_lang}
              saveTranslation={saveTranslation}
            />
          </div>
        ) : chatIsLive ? (
          <div className=" max-h-screen">
            <PhraseChat
              messages={presentableMessages}
              handleRequest={handleRequest}
              requestText={requestText}
              endSession={endSession}
              requestLoading={requestLoading}
            />
          </div>
        ) : (
          <div className="mt-5">
            <NestedObject
              data={genResponse}
              saveContent={saveContent}
              command={setCommand(firstWord)}
            />
          </div>
        ))}
    </div>
  );
};

export default ContentRequest;

import React, { useState } from 'react';
import { addPhrase, addTranslation, GenResponseType } from '@/lib/actions/phraseActions';
import { getModelSelection, getOpenAiKey, gptFormatType } from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';
import { createClient } from '@/utils/supabase/client';

import { LoadingButton } from '../ui/button-loading';
import { Textarea } from '../ui/textarea';
import NestedObject from './nested_object';
import SaveTranslationButton from './save_translation_button';
import LightSuggestionList from './suggestions/light_suggestion_list';

interface ContentRequestProps {
  text: string | null;
  lang: LanguagesISO639;
  userId: string | undefined;
  primaryPhraseIds?: string[];
  suggestions: string[];
  source: string;
}

const ContentRequest: React.FC<ContentRequestProps> = ({
  text,
  lang,
  userId,
  primaryPhraseIds,
  suggestions,
  source,
}) => {
  const supabase = createClient();
  const [genResponse, setGenResponse] = useState<GenResponseType | undefined>();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestText, setRequestText] = useState('');
  const firstWord = requestText.split(' ')[0];

  const setCommand = (firstWord: string) => {
    const word = firstWord ? firstWord[0].toUpperCase() + firstWord.slice(1) : '';
    if (
      word === 'Explain' ||
      word === 'Why' ||
      word === 'Extract' ||
      word === 'Translate' ||
      word === 'List' ||
      word === 'Generate'
    ) {
      return word;
    }
  };

  const captureCommand = () => {
    if (setCommand(firstWord)) {
      return { request: requestText, command: setCommand(firstWord) };
    }
    return { request: requestText, command: '' };
  };

  const selectSystemMessage = (command: string | undefined) => {
    const message =
      'The user will send you a text and a request for how to handle that content. Return as a JSON.';
    if (command === 'Explain' || command === 'Why') {
      return (
        message + `Return a JSON with key: "explanation" and value: <a string of the explanation>.`
      );
    }

    if (command === 'Translate') {
      return (
        message +
        `If the user asks for a translation, the return value should include { "input_lang": <the ISO 639-1 code of the text>, "input_text": <text of original>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation> }.`
      );
    }

    if (command === 'List' || command === 'Extract') {
      return (
        message +
        `The user will request a list of values. Each key is presented as the title of an expandable list. If the value is an object, the component calls itself again in a nested fashion. If it is a string, it is presented to the user. The goal is to organize the data. `
      );
    }

    if (command === 'Generate') {
      return message + `The user wants you to generate new content based on the text`;
    }

    return `The user will send you a text and a request for how to handle that content. Return as a JSON. The user will often be requesting a list of values. Each key is presented as the title of an expandable list. If the value is an object, the component calls itself again in a nested fashion. If it is a string, it is presented to the user. The goal is to organize the data. If the user asks for an explanation, return a JSON with key: "explanation" and value: <a string of the explanation>. If the user asks for a translation, the return value should include { "input_lang": <the ISO 639-1 code of the text>, "input_text": <text of original>, "output_text": <text of translation>, "output_lang": <the ISO 639-1 code of the translation>}.`;
  };

  const handleRequest = async () => {
    setRequestLoading(true);
    const { request, command } = captureCommand();
    const modelParams = {
      format: 'json_object' as gptFormatType,
      max_tokens: 1000,
      temperature: 0.9,
    };

    const messages = [
      {
        role: 'system',
        content: selectSystemMessage(command),
      },
      { role: 'user', content: `text: ${text}` },
      { role: 'user', content: `request: ${request}` },
    ];

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
      setGenResponse(JSON.parse(data));
    } catch (error) {
      alert('Sorry, it looks like the model returned the wrong format. Please try again.');
      setRequestLoading(false);
      throw Error('Error parsing JSON:', data);
    }
    setRequestLoading(false);
  };

  const saveContent = async (content: string): Promise<boolean> => {
    try {
      await addPhrase({ source, text: content.trim(), lang });
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
    if (primaryPhraseIds && primaryPhraseIds.length === 0) {
      await addTranslation({
        primaryPhraseIds,
        genResponse: {
          input_text: genResponse.input_text,
          input_lang: genResponse.input_lang,
          output_text: genResponse.output_text,
          output_lang: genResponse.output_lang,
        },
        source,
      });
    }
  };

  const setMaterialSuggestion = (suggestion: string) => {
    setRequestText(suggestion);
  };

  return (
    <div className="flex flex-col">
      <Textarea
        className="w-full"
        value={requestText}
        onChange={(e) => setRequestText(e.target.value)}
        placeholder="Type your request here"
      />
      <LoadingButton
        className="bg-blue-600 rounded-lg text-white p-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleRequest}
        text={setCommand(firstWord) ?? 'Request'}
        loadingText="Requesting"
        buttonState={requestLoading ? 'loading' : 'default'}
      />
      {suggestions.length > 0 && (
        <LightSuggestionList
          suggestions={suggestions}
          setMaterialSuggestion={setMaterialSuggestion}
          isLoading={requestLoading}
          includeSuggestionCreator={false}
          handleGenerateLessonSuggestions={() => {}}
        />
      )}
      <div>
        {setCommand(firstWord) === 'Translate' && primaryPhraseIds
          ? genResponse && (
              <SaveTranslationButton
                input_text={genResponse.input_text}
                input_lang={genResponse.input_lang}
                output_text={genResponse.output_text}
                output_lang={genResponse.output_lang}
                saveTranslation={saveTranslation}
              />
            )
          : genResponse && (
              <NestedObject
                data={genResponse}
                saveContent={saveContent}
                command={setCommand(firstWord)}
              />
            )}
      </div>
    </div>
  );
};

export default ContentRequest;

// app/dynamic-component/page.tsx

// this page calls the generate-component api and sends the response to the dynamic_component_loader.tsx page
'use client';

import { useState } from 'react';
import DynamicComponentLoader from './(components)/dynamic_component_loader';
import * as dependencies from './utils/componentDependencies';
import { getOpenAiKey, gptFormatType } from '@/lib/helpers/helpersAI';
import { getModelSelection } from '@/lib/helpers/helpersAI';
import { createClient } from '@/utils/supabase/client';
import { componentRequestPrompt } from '@/lib/helpers/promptGenerators';

export default function DynamicComponentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [componentCode, setComponentCode] = useState<string | null>(null);
  const [componentProps, setComponentProps] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const modelParams = {
    format: { type: 'json_object' } as gptFormatType,
    max_tokens: 10000,
    temperature: 1,
  };

  const messages = [
    {
      role: 'system',
      content: `Your job is to return a working component paired with the appropriate data. Return a JSON object. Every response must include exactly three key/value pairs:

- **componentType**: a string representing the type of component
- **props**: an object representing the component's properties
- **react_node**: a react component using tailwindcss v3 for design. it should take the form of a string containing EXACTLY this format:
\`\`\`
(dependencies) => {
const { addTranslation, addPhrase, getHumanDate } = dependencies;

// Component data here
const ComponentName = () => {
  // Component implementation
  return (
    // JSX here
  );
};

return ComponentName;
}
\`\`\`
Do not add any additional wrapping, parentheses, or modifications to this format. 
`,
    },

    {
      role: 'user',
      content: componentRequestPrompt({
        functions: [
          {
            code: 'await addTranslation ({ primaryPhraseIds, genResponse, source, phraseType, revalidationPath }: AddTranslationProps) ',
            purpose: 'addTranslation is a function that saves translations to the database.',
          },
          {
            code: `await addPhrase  ({
  text: string;
  lang: Iso639LanguageCode;
  source?: string;
  filename?: string;
  type: PhraseType;
  associationId?: string;
})`,
            purpose: 'addPhrase is a function that adds a phrase to the database.',
          },
        ],
        types: [
          `type AddTranslationProps = {
        primaryPhraseIds?: string[];
        genResponse: TranslationResponseType;
        source: string;
        phraseType?: PhraseType;
      }`,
          `type TranslationResponseType = {
        input_text: string;
        input_lang: string;
        output_text: string;
        output_lang: string;
      };`,
          `type SourceOptionType = 'home' | 'history' | 'lesson' | 'correction' | 'transcript' | 'chat';`,
          `type PhraseType = "phrase" | "recording" | "word";`,
          `type Iso639LanguageCode = <ISO639 Language Codes> `,
        ],
      }),
    },
    {
      role: 'user',
      content:
        'list a bunch of german phrases I may want to save to my library.  I need a component that serves my request with an interactive component based on the available functions and types.',
    },
  ];
  const fetchComponentFromLLM = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('gen-component', {
        body: {
          userApiKey: getOpenAiKey(),
          modelSelection: getModelSelection(),
          modelParams,
          messages,
        },
      });

      if (error) {
        console.error('Failed to fetch component:', error);
        throw new Error('Failed to fetch component');
      }

      if (data.error) {
        throw new Error(data.error);
      }
      const { react_node, props } = JSON.parse(data.content);

      setComponentCode(react_node);
      setComponentProps(props);
    } catch (error) {
      console.error('Failed to fetch component:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dynamic Component Demo</h1>

      <button
        onClick={fetchComponentFromLLM}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Generate Component'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl mb-4">Component Preview:</h2>

        {componentCode ? (
          <DynamicComponentLoader
            componentCode={componentCode}
            dependencies={dependencies}
            componentProps={componentProps}
          />
        ) : (
          <div className="text-gray-500">Click the button to generate a component</div>
        )}
      </div>
    </div>
  );
}

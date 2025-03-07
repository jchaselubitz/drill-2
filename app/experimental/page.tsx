// app/dynamic-component/page.tsx

'use client';

import { useState } from 'react';
import { ButtonLoadingState, LoadingButton } from '@/components/ui/button-loading';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';

import DynamicComponentLoader from './(components)/dynamic_component_loader';
import * as dependencies from './utils/componentDependencies';

export default function DynamicComponentPage() {
  const [buttonState, setButtonState] = useState<ButtonLoadingState>('default');
  const [prompt, setPrompt] = useState<string>('');
  const [componentCode, setComponentCode] = useState<string | null>(null);
  const [componentProps, setComponentProps] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const isAnthropic = true;
  const fetchComponentFromLLM = async () => {
    setButtonState('loading');
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('gen-component', {
        body: {
          // userApiKey: getOpenAiKey(),
          // modelSelection: getModelSelection(),
          apiSelection: isAnthropic ? 'anthropic' : 'openAi',
          prompt,
          dependencies: Object.keys(dependencies).join(', '),
        },
      });

      if (error) {
        console.error('Failed to fetch component:', error);
        throw new Error('Failed to fetch component');
      }

      if (data.error) {
        throw new Error(data.error);
      }
      // const data = TEST_RESPONSE;
      const parsedCode = isAnthropic ? `${data.react_node}` : JSON.parse(data).react_node;
      const parsedProps = isAnthropic ? `${data.props}` : JSON.parse(data).props;
      setComponentCode(parsedCode);
      setComponentProps(parsedProps);
      console.log(parsedCode);
    } catch (error) {
      console.error('Failed to fetch component:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setButtonState('default');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dynamic Component Demo</h1>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <LoadingButton
          onClick={fetchComponentFromLLM}
          disabled={prompt.length === 0}
          buttonState={buttonState}
          text="Generate Component"
          loadingText="Generating Component..."
          successText="Component Generated"
          errorText="Failed to Generate Component"
          setButtonState={setButtonState}
          reset
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mt-4 w-full">
        {componentCode && (
          <DynamicComponentLoader
            componentCode={componentCode}
            dependencies={dependencies}
            componentProps={componentProps}
          />
        )}
      </div>
    </div>
  );
}

const TEST_RESPONSE = {
  componentType: 'TranslationSaver',
  props:
    '{\n  "initialPhrases": [\n    "Wie geht es dir?",\n    "Ich mag Kaffee",\n    "Wo ist der Bahnhof?",\n    "Kannst du mir helfen?",\n    "Das Wetter ist schön heute",\n    "Ich lerne Deutsch",\n    "Sprechen Sie Englisch?",\n    "Entschuldigung",\n    "Ich verstehe nicht",\n    "Auf Wiedersehen"\n  ]\n}',
  react_node:
    '(dependencies) => {\nconst { addTranslation, addPhrase, getHumanDate } = dependencies;\n\nconst TranslationSaver = () => {\n  const [selectedPhrases, setSelectedPhrases] = React.useState([]);\n  const [currentSource, setCurrentSource] = React.useState(\'home\');\n  const [language, setLanguage] = React.useState(\'de\');\n\n  const initialPhrases = [\n    "Wie geht es dir?",\n    "Ich mag Kaffee",\n    "Wo ist der Bahnhof?",\n    "Kannst du mir helfen?",\n    "Das Wetter ist schön heute",\n    "Ich lerne Deutsch",\n    "Sprechen Sie Englisch?",\n    "Entschuldigung",\n    "Ich verstehe nicht",\n    "Auf Wiedersehen"\n  ];\n\n  const handlePhraseSelect = (phrase) => {\n    setSelectedPhrases(prev => \n      prev.includes(phrase) \n        ? prev.filter(p => p !== phrase)\n        : [...prev, phrase]\n    );\n  };\n\n  const saveSelectedPhrases = () => {\n    selectedPhrases.forEach(phrase => {\n      const translationResponse = {\n        input_text: phrase,\n        input_lang: \'de\',\n        output_text: phrase,\n        output_lang: \'de\'\n      };\n\n      addTranslation({\n        primaryPhraseIds: [],\n        genResponse: translationResponse,\n        source: currentSource,\n        phraseType: \'phrase\'\n      });\n    });\n\n    // Clear selection after saving\n    setSelectedPhrases([]);\n  };\n\n  return (\n    <div className="p-4 bg-gray-100 rounded-lg">\n      <h2 className="text-xl font-bold mb-4 text-gray-800">Save German Phrases</h2>\n      \n      <div className="mb-4">\n        <label className="block text-sm font-medium text-gray-700">Source:</label>\n        <select \n          value={currentSource}\n          onChange={(e) => setCurrentSource(e.target.value)}\n          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"\n        >\n          <option value="home">Home</option>\n          <option value="history">History</option>\n          <option value="lesson">Lesson</option>\n          <option value="correction">Correction</option>\n          <option value="transcript">Transcript</option>\n          <option value="chat">Chat</option>\n        </select>\n      </div>\n\n      <div className="grid grid-cols-2 gap-2 mb-4">\n        {initialPhrases.map((phrase, index) => (\n          <button\n            key={index}\n            onClick={() => handlePhraseSelect(phrase)}\n            className={`p-2 rounded-md text-left ${\n              selectedPhrases.includes(phrase) \n                ? \'bg-green-500 text-white\' \n                : \'bg-white text-gray-700 border\'\n            }`}\n          >\n            {phrase}\n          </button>\n        ))}\n      </div>\n\n      <div className="flex justify-between items-center">\n        <span className="text-sm text-gray-600">\n          Selected: {selectedPhrases.length} phrases\n        </span>\n        <button\n          onClick={saveSelectedPhrases}\n          disabled={selectedPhrases.length === 0}\n          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"\n        >\n          Save Selected Phrases\n        </button>\n      </div>\n    </div>\n  );\n};\n\nreturn TranslationSaver;\n}',
};

// this is how it will be used
// \`\`\`
// const functionBody =
//         try {
//           const {\${Object.keys(dependencies).join(', ')}} = dependencies;
//           const ComponentFunction = \${transformedCode};
//           return ComponentFunction(dependencies, props);
//         } catch (error) {
//           console.error('Error in component evaluation:', error);
//           throw error;
//         }

//       // Execute the code in a new context with React and dependencies
//       const executeCode = new Function('React', 'dependencies', 'props', functionBody);
//       const DynamicComponent = executeCode(React, dependencies, componentProps);
// \`\`\`

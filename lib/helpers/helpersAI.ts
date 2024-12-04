export type AiMessage = {
  role: string;
  content: string;
};

//this is mirrored in supabase/functions/_shared.ts
export enum OpenAiModel {
  'gpt4oMini' = 'gpt-4o-mini',
  'gpt4' = 'gpt-4o',
}

export const getModelSelection = () => {
  if (typeof window !== 'undefined') {
    const selection = localStorage.getItem('OpenAIModel') ?? 'gpt4oMini';
    return selection === 'gpt4' ? OpenAiModel.gpt4 : OpenAiModel.gpt4oMini;
  }
};
export const getOpenAiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('OpenAIKey') ?? undefined;
  }
};

export type gptFormatType = 'json_object' | 'text';
export type ModelParamsType = {
  format: gptFormatType;
  presence_penalty?: number;
  frequency_penalty?: number;
  temperature?: number;
  max_tokens?: number;
};

export type AiGenerateProps = {
  modelParams: ModelParamsType;
  messages: AiMessage[];
  dbParams?: any;
  dbCallback?: any;
};

export const selectSystemMessage = (command: string | undefined, isExplanation: boolean) => {
  const message =
    'The user will send you a text and a request for how to handle that content. Return as a JSON.';
  if (isExplanation) {
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
// const AITESTSTRING = `{"concepts":[
//   {
//     "title": "Noun Gender",
//     "description": "Learn the gender (masculine, feminine, or neuter) of German nouns."
//   },
//   {
//     "title": "Verb Conjugation",
//     "description": "Practice conjugating regular and irregular verbs in different tenses."
//   },
//   {
//     "title": "Cases (Nominative, Accusative, Dative, Genitive)",
//     "description": "Understand how to use different cases for nouns, pronouns, and articles."
//   },
//   {
//     "title": "Word Order",
//     "description": "Master the correct word order in German sentences, including main and subordinate clauses."
//   },
//   {
//     "title": "Modal Verbs",
//     "description": "Learn how to use modal verbs like können, müssen, wollen, etc. in different contexts."
//   },
//   {
//     "title": "Relative Clauses",
//     "description": "Practice constructing and using relative clauses to provide additional information."
//   },
//   {
//     "title": "Prepositions",
//     "description": "Familiarize yourself with common prepositions and their usage in different contexts."
//   }
// ]}`;

// export const MOCK_ARBITRARY_RESPONSE = `{"samplekey":{"nouns": ["Uhr", "Nachrichten", "Übersicht", "SPD", "FDP", "Treffen", "Berlin", "Spitzenkandidaten", "Europawahl", "Proteste", "Rechtsextremismus", "Vorwürfen", "Mitarbeiter", "UNO-Flüchtlingshilfswerks", "Palästinenser", "Generalsekretär", "Vereinten", "Nationen", "Konsequenzen", "Meldungen"],
// "verbs": ["bestimmen", "geplant", "hat", "angekündigt"],
// "adjectives": ["getrennten", "wieder", "vielerorts", "guterresch", "Einzelnen"]}}`;

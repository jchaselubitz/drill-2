import { addHistory } from '../actions/actionsHistory';
import { generateHistory } from '../aiGenerators/generators_history';
import { ChatMessage } from '../aiGenerators/types_generation';
import { LanguagesISO639 } from '../lists';

import { BaseHistory } from 'kysely-codegen';

export async function processHistory({
  messages,
  existingHistory,
  learningLang,
}: {
  messages: ChatMessage[];
  existingHistory: BaseHistory | undefined;
  learningLang: LanguagesISO639;
}) {
  try {
    const { insights, vocabulary, concepts } = await generateHistory({
      messages: messages.filter((m) => m.role === 'assistant'),
      existingHistory,
      lang: learningLang,
    });

    await addHistory({
      insights,
      vocabulary,
      concepts,
      lang: learningLang,
      existingHistory: existingHistory,
    });
  } catch (e) {
    console.error(e);
  }
}

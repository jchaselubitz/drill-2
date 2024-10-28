// ==== Lesson Suggestions ====

import type { gptFormatType } from './helpersAI';
import { LanguagesISO639, getLangName } from './lists';

export const lessonGenerationSystemInstructions =
	'Return a JSON that is a list of objects, each including the "title" of the concept and a very short "description". Your response will be parsed as follows: JSON.parse(<your-response>)';

export const requestLessonSuggestions = ({
	language,
	level
}: {
	language: string;
	level: string;
}): { prompt: string; format: gptFormatType } => {
	const prompt = `I am studying ${language}, and my current skill level is: ${level} (according to the Common European Framework of Reference for Languages). What are the top seven grammatical concepts you think I should drill? `;
	const format = 'json_object';
	return { prompt, format };
};

// ==== Card Content Generation ====

export const cardGenerationSystemInstructions = ({
	lang1,
	lang2
}: {
	lang1: LanguagesISO639;
	lang2: LanguagesISO639;
}) =>
	`The student will ask you for a list of examples, which will be added to flashcards. Your response will be parsed as follows: JSON.parse(<your-response>). Return a "cards" JSON that is a list of objects, each with the following keys: phrase_primary, phrase_secondary. The phrase_primary is the ${lang1} phrase, and the phrase_secondary is the ${lang2} phrase. The format should therefore be: [{phrase_primary: {text: "phrase1", lang:${lang1}}, phrase_secondary: {text: "phrase2", lang:${lang2}}}, ...]`;

export const cardResponseChecks = ({
	response,
	lang1,
	lang2
}: {
	response: string;
	lang1: string;
	lang2: string;
}) => {
	if (response === '') {
		throw Error('No cards generated. Try again.');
	}

	const cardsObject = JSON.parse(response);

	if (!cardsObject.cards) {
		alert('OpenAI returned wrong format. This happens sometimes. Please try again.');
		throw Error('OpenAI returned wrong format (not .cards). Please try again.');
	}
	const cardsArray = cardsObject.cards;
	if (cardsArray.length === 0) {
		throw Error('No cards generated. Try again.');
	}
	if (!cardsArray[0].phrase_primary.lang || !cardsArray[0].phrase_secondary.text) {
		alert('OpenAI returned wrong format. This happens sometimes. Please try again.');
		throw Error(
			'OpenAI returned wrong format (not phrase_primary/phrase_secondary). Please try again.'
		);
	}
	return cardsArray;
};

export const requestCardSuggestions = ({
	concept,
	userLanguage,
	studyLanguage,
	level
}: {
	concept: string;
	studyLanguage: LanguagesISO639 | '';
	userLanguage: LanguagesISO639 | '';
	level: string;
}): { prompt: string; format: gptFormatType } => {
	if (studyLanguage === '' || concept === '' || level === '' || userLanguage === '') {
		throw new Error('studyLanguage, concept, or level is empty');
	}

	const prompt = `You are helping a student study ${getLangName(
		studyLanguage
	)} at a level that matches ${level} (according to the Common European Framework of Reference for Languages). You are creating flashcards, with ${getLangName(
		userLanguage
	)} on one side and ${getLangName(
		studyLanguage
	)} on the other. Generate twenty long sentences that demonstrate the concept of ${concept} in ${getLangName(
		studyLanguage
	)}. The format of the JSON should be as follows: {${userLanguage}: "sentence", ${studyLanguage}: "sentence"}.`;
	const format = 'json_object';
	return { prompt, format };
};

// ==== Other Content Generation ====

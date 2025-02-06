import { BasePhrase } from 'kysely-codegen';

type Lesson = {
  id: string;
  title: string;
  // translation: Translation[];
  sideOne: string;
  sideTwo: string;
};

export const sortLessonTranslation = (
  translation: any,
  lesson: Lesson
): { base: BasePhrase; target: BasePhrase } => {
  const phrases = [translation.phrasePrimary, translation.phraseSecondary];
  const base = phrases.find((p) => p.lang === lesson.sideOne) as BasePhrase;
  const target = phrases.find((p) => p.lang === lesson.sideTwo) as BasePhrase;
  if (!base.text || !target.text) throw Error('missing phrase');
  return {
    base,
    target,
  };
};

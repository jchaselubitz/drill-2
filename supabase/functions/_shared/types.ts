export interface Phrase {
  text: string;
  lang: string;
}
export interface Translation {
  phrase_primary_id: Phrase;
  phrase_secondary_id: Phrase;
}
export interface Lesson {
  id: string;
  title: string;
  translation: Translation[];
  side_one: string;
  side_two: string;
}

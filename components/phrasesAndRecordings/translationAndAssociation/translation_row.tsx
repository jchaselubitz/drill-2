import { Iso639LanguageCode } from 'kysely-codegen';
import { useRouter } from 'next/navigation';
import React from 'react';
import TtsButton from '@/components/ai_elements/tts_button';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLessonsContext } from '@/contexts/lessons_context';
import { useLibraryContext } from '@/contexts/library_context';
import { addTranslationToLesson } from '@/lib/actions/lessonActions';
import { getLangIcon } from '@/lib/lists';

export interface TranslationPhrase {
  id: string;
  text: string;
  lang: Iso639LanguageCode;
  lessonId: string;
  lessonTitle: string;
  translationId: string;
}
interface TranslationRowProps {
  translationsPhrase: TranslationPhrase;
  phraseLang: Iso639LanguageCode;
  navigateToPhrase?: (id: string) => void;
}

const TranslationRow: React.FC<TranslationRowProps> = ({
  translationsPhrase,
  navigateToPhrase,
  phraseLang,
}) => {
  const router = useRouter();
  const bucket = 'text-to-speech';
  const { setSelectedPhrasePage } = useLibraryContext();

  const { userLessons } = useLessonsContext();

  const handlePhraseClick = () => {
    if (navigateToPhrase) {
      navigateToPhrase(translationsPhrase.id);
    } else {
      setSelectedPhrasePage({ phraseId: translationsPhrase.id });
    }
  };

  const handleAddTooLesson = async (lessonId: string) => {
    await addTranslationToLesson({
      lessonId,
      translationId: translationsPhrase.translationId,
    });
  };

  const getCompatibleLessons = () => {
    return userLessons.filter((lesson) => {
      return (
        (lesson.sideOne === translationsPhrase.lang ||
          lesson.sideTwo === translationsPhrase.lang) &&
        (lesson.sideOne === phraseLang || lesson.sideTwo === phraseLang)
      );
    });
  };

  const compatibleLessons = getCompatibleLessons();

  return (
    <div
      key={translationsPhrase.id}
      className="justify-between border-b border-gray-200 p-2 w-full "
    >
      <div className="flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-2">
          <div>{getLangIcon(translationsPhrase.lang)}</div>

          <button className="flex items-center gap-1 text-left" onClick={handlePhraseClick}>
            {translationsPhrase.text}
          </button>
        </div>
        <div className="w-12">
          <TtsButton text={translationsPhrase.text} bucket={bucket} lacksAudio={false} />
        </div>
      </div>
      <div className="mt-2">
        {compatibleLessons[0] && (
          <div className="ml-5  flex items-center gap-2 ">
            Lesson:
            <Select
              onValueChange={(v) => handleAddTooLesson(v)}
              defaultValue={translationsPhrase.lessonId?.toString() || ''}
            >
              <SelectTrigger className="flex flex-grow h-8 max-w-fit">
                <SelectValue placeholder="Add to lesson" />
              </SelectTrigger>

              <SelectContent>
                {compatibleLessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
                <Separator />

                <Button
                  variant={'secondary'}
                  className="mt-1 w-full"
                  onClick={() => router.push('/lessons')}
                >
                  + New lesson
                </Button>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationRow;

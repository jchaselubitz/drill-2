import { getLessons } from '@/lib/actions/lessonActions';
import { getFileList } from '@/lib/helpers/helpersAudio';
import { hashString } from '@/lib/helpers/helpersDB';
import { createClient } from '@/utils/supabase/server';

import LessonControlBar from './(components)/lesson_control_bar';
import LessonSettings from './(components)/lesson_settings';
import PhraseList from './(components)/phrase_list';

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = createClient();

  const resp = await getLessons(lessonId);
  const lesson = resp[0];

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  const bucket = 'text-to-speech';
  const fileList = (await getFileList({ supabase, bucket })).map((file) => file.name);

  const withoutAudio = await Promise.all(
    lesson.translations.map(async (translation) => {
      const text = translation?.phraseTarget.text as string;
      const fileName = ((await hashString(text as string)) + '.mp3') as string;
      if (!fileList.includes(fileName)) {
        return translation;
      }
    })
  );

  const translationsWithoutAudio = withoutAudio.filter(Boolean);

  return (
    <div className="m-4 p-2 rounded-lg flex flex-col h-full w-full">
      <LessonControlBar lesson={lesson} />
      <LessonSettings lesson={lesson} translationsWithoutAudio={translationsWithoutAudio} />
      <hr className="border-gray-300 my-5" />
      <PhraseList
        side1={lesson.sideOne}
        side2={lesson.sideTwo}
        translations={lesson.translations}
        bucket={bucket}
        translationsWithoutAudio={translationsWithoutAudio}
      />
    </div>
  );
}

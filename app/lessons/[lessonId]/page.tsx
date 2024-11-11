import LessonControlBar from './(components)/lesson_control_bar';
import LessonSettings from './(components)/lesson_settings';
import { getLesson } from '@/lib/actions/lessonActions';

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    return <div>Lesson not found</div>;
  }
  return (
    <div className="m-4 rounded-lg flex flex-col h-full w-full">
      <LessonControlBar lesson={lesson} />
      <LessonSettings lesson={lesson} />
    </div>
  );
}

import { getSubjects } from '@/lib/actions/lessonActions';

import LessonsLayout from './lessons_layout';

export default async function LessonsPage() {
  const subjects = await getSubjects();

  return <LessonsLayout subjects={subjects} />;
}

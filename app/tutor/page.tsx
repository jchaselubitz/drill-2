import { getTutorTopics } from '@/lib/actions/tutorActions';

import TopicList from './(components)/topic_list';

export default async function TutorPage() {
  const topics = await getTutorTopics();

  return (
    <div className="pt-2 md:pt-4">
      <TopicList topics={topics} />
    </div>
  );
}

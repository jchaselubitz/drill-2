import { getTutorTopics } from '@/lib/actions/tutorActions';

import TopicList from './(components)/topic_list';

export default async function TutorPage() {
  const topics = await getTutorTopics();

  return <TopicList topics={topics} />;
}

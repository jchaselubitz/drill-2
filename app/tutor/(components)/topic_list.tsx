import { BaseTutorTopic } from 'kysely-codegen';
import React from 'react';

import TopicCreationForm from './topic_creation_form';
import TopicListItem from './topic_list_item';

interface TopicListProps {
  topics: BaseTutorTopic[];
}

const TopicList: React.FC<TopicListProps> = ({ topics }) => {
  return (
    <div className="flex flex-col gap-3 ">
      {topics.map((topic) => (
        <TopicListItem key={topic.id} topic={topic} />
      ))}
      <TopicCreationForm />
    </div>
  );
};

export default TopicList;

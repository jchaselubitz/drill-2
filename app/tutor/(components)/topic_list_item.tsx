import { BaseTutorTopic } from 'kysely-codegen';
import Link from 'next/link';
import React from 'react';

interface TopicListItemProps {
  topic: BaseTutorTopic;
}

const TopicListItem: React.FC<TopicListItemProps> = ({ topic }) => {
  // const [loadingState, setLoadingState] = React.useState(false);

  return (
    <Link key={topic.id} href={`/tutor/${topic.id}`}>
      <div className="flex justify-between p-3 border border-zinc-300 rounded-lg w-full shadow-sm hover:bg-zinc-50 items-center">
        <div className="text-left">
          <div className="">{topic.instructions}</div>
          <div className="text-xs text-gray-500">{topic.level}</div>
        </div>
        {/* <Loader2Icon className="mr-2 h-6 w-6 animate-spin" /> */}
      </div>
    </Link>
  );
};

export default TopicListItem;

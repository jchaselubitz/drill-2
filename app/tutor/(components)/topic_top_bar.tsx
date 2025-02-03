'use client';

import { BaseTutorTopic } from 'kysely-codegen';
import { Trash, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { deleteTutorTopic } from '@/lib/actions/tutorActions';

type TopicTopBarProps = {
  topic: BaseTutorTopic;
};

const TopicTopBar: React.FC<TopicTopBarProps> = ({ topic }) => {
  const router = useRouter();

  const handleDelete = async () => {
    confirm('Are you sure you want to delete this topic?');
    await deleteTutorTopic(topic.id);
    router.push('/tutor');
  };

  return (
    <div className="sticky top-0 z-30 flex w-full justify-between items-center min-h-14 px-4 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <Button variant={'ghost'} size="icon" onClick={handleDelete}>
          <Trash color="#b91c1c" />
        </Button>
      </div>
      <Button variant={'ghost'} size={'icon'} onClick={() => router.back()}>
        <XIcon />
      </Button>
    </div>
  );
};

export default TopicTopBar;

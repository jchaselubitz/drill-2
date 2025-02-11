import { NewMedia } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import React from 'react';

import { Button } from '../ui/button';

interface PodcastListItemProps {
  podcast: NewMedia;
  handlePodcastSelect: (feed: string) => void;
  removePodcast: (id: string) => Promise<void>;
}

const PodcastListItem: React.FC<PodcastListItemProps> = ({
  podcast,
  handlePodcastSelect,
  removePodcast,
}) => {
  if (!podcast) return null;

  return (
    <div className="relative rounded-md border overflow-hidden shadow-sm active:shadow-lg hover:shadow-lg w-24 h-36">
      <button
        onClick={() => handlePodcastSelect(podcast.mediaUrl)}
        aria-label="load podcast"
        className="flex flex-col "
      >
        <img
          src={podcast.imageUrl ?? ''}
          alt={podcast.title ?? 'podcast cover image'}
          className="h-24 object-cover"
        />

        <div className="p-1 text-xs text-left font-medium text-zinc-700 line-clamp-2">
          {podcast.title}
        </div>
      </button>
      <Button
        size="icon"
        variant="outline"
        className="absolute top-1 right-1 rounded-full"
        onClick={async (e) => {
          e.stopPropagation();
          removePodcast(podcast.id as string);
        }}
      >
        <XIcon />
      </Button>
    </div>
  );
};

export default PodcastListItem;

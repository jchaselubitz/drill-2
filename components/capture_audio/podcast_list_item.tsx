import { NewMedia } from 'kysely-codegen';
import { XIcon } from 'lucide-react';
import React from 'react';

import { Button } from '../ui/button';

interface PodcastListItemProps {
  podcast: NewMedia;
  handlePodcastSelect: (podcast: NewMedia) => void;
  removePodcast: (id: string) => Promise<void>;
}

const PodcastListItem: React.FC<PodcastListItemProps> = ({
  podcast,
  handlePodcastSelect,
  removePodcast,
}) => {
  if (!podcast) return null;

  return (
    <div
      key={podcast.id}
      className="relative rounded-md border overflow-hidden shadow-md active:shadow-none"
    >
      <button onClick={() => handlePodcastSelect(podcast)} aria-label="load podcast">
        <img src={podcast.imageUrl ?? ''} alt={podcast.title ?? 'podcast cover image'} />
        <div className="p-1 text-xs font-medium text-zinc-700">{podcast.title}</div>
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

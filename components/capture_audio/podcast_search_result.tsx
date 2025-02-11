import React from 'react';

export type Podcast = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  feedUrl: string;
};

interface PodcastResults {
  podcast: Podcast;
  handlePodcastSelect: (feed: string) => void;
}

const PodcastSearchResult: React.FC<PodcastResults> = ({ podcast, handlePodcastSelect }) => {
  if (!podcast) return null;

  return (
    <button
      key={podcast.collectionId}
      className="flex text-left rounded-md border overflow-hidden shadow-sm active:shadow-lg hover:shadow-lg w-full"
      onClick={() => handlePodcastSelect(podcast.feedUrl)}
      aria-label="load podcast"
    >
      <>
        <img
          src={podcast.artworkUrl100 ?? ''}
          alt={podcast.collectionName ?? 'podcast cover image'}
          height={60}
          width={60}
        />

        <div className="p-2 text-sm font-medium text-zinc-700 line-clamp-2">
          {podcast.collectionName}
        </div>
      </>
    </button>
  );
};

export default PodcastSearchResult;

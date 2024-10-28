import React from 'react';

interface Episode {
  title: string;
  description: string;
  imageURL: string;
  date: string;
  audioURL: string;
}

interface PodcastListItemProps {
  episode: Episode;
  setEpisodeURL: (url: string) => void;
}

const PodcastListItem: React.FC<PodcastListItemProps> = ({ episode, setEpisodeURL }) => {
  const { title, description, imageURL, date, audioURL } = episode;

  const setURL = () => {
    setEpisodeURL(audioURL);
  };

  return (
    <button onClick={setURL} className="text-left">
      <div className="flex rounded-lg border-2 hover:border-gray-500">
        <img className="rounded-md w-16 h-16" src={imageURL} alt={title} />
        <div className="p-2 text-xs">
          <h3>{date}</h3>
          <h3>{title}</h3>
        </div>
      </div>
    </button>
  );
};

export default PodcastListItem;

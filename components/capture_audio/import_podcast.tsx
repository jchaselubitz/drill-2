import { PodcastIcon } from 'lucide-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import PodcastListItem from './podcast_list_item';

type ImportPodcastProps = {
  importPodcast: (url: string) => void;
};

const ImportPodcast: FC<ImportPodcastProps> = ({ importPodcast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 0);
  };

  const closeModal = () => {
    window.removeEventListener('click', handleClickOutside);
    setIsOpen(false);
  };

  // const triggerFileInput = () => {
  //   importPodcast(inputValue);
  //   closeModal();
  // };

  const loadPodcastList = () => {
    fetch(`/api/podcasts?url=${inputValue}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEpisodes(data.episodes);
      })
      .catch((error) => {
        throw new Error(`Failed to load podcast list: ${error}`);
      });
  };

  const setEpisodeURL = (url: string) => {
    importPodcast(url);
    closeModal();
  };

  const handleClickOutside = (event: Event) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  });

  return (
    <>
      {isOpen ? (
        <div className="fixed top-0 bottom-0 left-0 right-0 p-3 bg-gray-800 bg-opacity-40 z-20">
          <div
            className="rounded-lg p-4 mt-10 mx-auto bg-white w-full md:w-96 flex flex-col gap-2"
            ref={modalRef}
          >
            <Input
              name="link"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter file url"
            />
            {episodes.length > 0 && (
              <div className="flex flex-col overflow-scroll h-96 gap-2">
                {episodes.map((episode) => (
                  <PodcastListItem
                    key={episode.id}
                    episode={episode}
                    setEpisodeURL={setEpisodeURL}
                  />
                ))}
              </div>
            )}
            <Button onClick={loadPodcastList}>Load</Button>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700"
          onClick={openModal}
        >
          <PodcastIcon />
        </button>
      )}
    </>
  );
};

export default ImportPodcast;

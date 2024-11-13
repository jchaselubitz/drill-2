import { PodcastIcon } from 'lucide-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import PodcastListItem from './podcast_list_item';

type ImportPodcastProps = {
  importPodcast: (url: string) => void;
};

const ImportPodcast: FC<ImportPodcastProps> = ({ importPodcast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);

  const closeModal = () => {
    setIsOpen(false);
  };

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
      }}
    >
      <DialogTrigger asChild>
        <button
          className="p-0 flex items-center justify-center w-10 h-10 rounded-full border border-gray-700"
          onClick={() => setIsOpen(true)}
        >
          <PodcastIcon />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[325px]  max-h-screen">
        <Input
          name="link"
          className="mt-4"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter file url"
        />
        {episodes.length > 0 && (
          <div className="h-full flex flex-col overflow-scroll gap-2">
            {episodes.map((episode) => (
              <PodcastListItem key={episode.id} episode={episode} setEpisodeURL={setEpisodeURL} />
            ))}
          </div>
        )}
        <Button onClick={loadPodcastList}>Load</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPodcast;

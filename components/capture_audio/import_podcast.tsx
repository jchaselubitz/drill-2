import { BaseMedia, NewMedia } from 'kysely-codegen';
import { PodcastIcon } from 'lucide-react';
import React, { FC, useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { addUserMedia, removeUserMedia } from '@/lib/actions/captureActions';
import { fetchAndParseRSSFeed } from '@/lib/helpers/helpersPodcast';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import EpisodeListItem from './episode_list_item';
import PodcastListItem from './podcast_list_item';

type ImportPodcastProps = {
  importPodcast: (url: string) => void;
};

const ImportPodcast: FC<ImportPodcastProps> = ({ importPodcast }) => {
  const { media } = useUserContext();
  const [podcasts, setPodcasts] = useState<BaseMedia[] | NewMedia[]>(media ?? []);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const loadPodcastList = async () => {
    const newPodcast = await fetchAndParseRSSFeed(inputValue);
    fetch(`/api/podcasts?url=${inputValue}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEpisodes(data.episodes);
        if (newPodcast && !podcasts.find((podcast) => podcast.mediaUrl === newPodcast.mediaUrl)) {
          addUserMedia(newPodcast);
          setPodcasts([...podcasts, newPodcast]);
        }
      })
      .catch((error) => {
        throw new Error(`Failed to load podcast list: ${error}`);
      });
  };

  const handlePodcastSelect = (podcast: NewMedia) => {
    setInputValue(podcast.mediaUrl ?? '');
    loadPodcastList();
  };

  const removePodcast = async (id: string) => {
    await removeUserMedia(id);
    setPodcasts(podcasts.filter((p) => p.id !== id));
  };

  const setEpisodeURL = async (url: string) => {
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

      <DialogContent className="max-w-[425px] max-h-screen">
        <DialogHeader>
          <DialogTitle>Import a podcast</DialogTitle>
        </DialogHeader>

        <Input
          name="link"
          className="mt-4"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter file url"
        />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col gap-3">
            {podcasts?.map((podcast) => (
              <PodcastListItem
                key={podcast.id}
                podcast={podcast}
                handlePodcastSelect={handlePodcastSelect}
                removePodcast={removePodcast}
              />
            ))}
          </div>
          <div className="col-span-2">
            {episodes.length > 0 && (
              <div className="h-full flex flex-col overflow-scroll gap-2">
                {episodes.map((episode) => (
                  <EpisodeListItem
                    key={episode.id}
                    episode={episode}
                    setEpisodeURL={setEpisodeURL}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <Button onClick={loadPodcastList}>Load</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPodcast;

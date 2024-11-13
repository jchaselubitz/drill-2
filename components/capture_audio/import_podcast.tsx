import { PodcastIcon } from 'lucide-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import PodcastListItem from './podcast_list_item';
import { updateUserPodcasts } from '@/lib/actions/captureActions';
import { useUserContext } from '@/contexts/user_context';
import { Podcast } from 'kysely-codegen';
import { fetchAndParseRSSFeed } from '@/lib/helpers/helpersPodcast';

type ImportPodcastProps = {
  importPodcast: (url: string) => void;
};

const ImportPodcast: FC<ImportPodcastProps> = ({ importPodcast }) => {
  const { podcasts } = useUserContext();
  const [podcastUrls, setPodcastUrls] = useState<(Podcast | null)[] | undefined | null>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    async () => {
      if (podcasts) {
        const podcastSummaries = await Promise.all(
          podcasts.map(async (podcast) => fetchAndParseRSSFeed(podcast))
        );
        setPodcastUrls(podcastSummaries);
      }
    };
  }, [podcasts]);

  const loadPodcastList = async () => {
    fetch(`/api/podcasts?url=${inputValue}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEpisodes(data.episodes);
        const updatedPodcastUrls = podcasts ? podcasts.concat(inputValue) : [inputValue];
        updateUserPodcasts({ podcastUrls: updatedPodcastUrls });

        // const newPodcastSummary = await fetchAndParseRSSFeed(inputValue);
        // setPodcastUrls({ ...podcastUrls, newPodcastSummary });
      })
      .catch((error) => {
        throw new Error(`Failed to load podcast list: ${error}`);
      });
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
          <div className="col-span-1 flex flex-col">
            {podcastUrls?.map((podcast) => <div key={podcast?.title}>{podcast?.title}</div>)}
          </div>
          <div className="col-span-2">
            {episodes.length > 0 && (
              <div className="h-full flex flex-col overflow-scroll gap-2">
                {episodes.map((episode) => (
                  <PodcastListItem
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

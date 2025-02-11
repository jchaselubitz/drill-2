import { BaseMedia, NewMedia } from 'kysely-codegen';
import { PodcastIcon } from 'lucide-react';
import React, { FC, FormEvent, useState } from 'react';
import { useUserContext } from '@/contexts/user_context';
import { addUserMedia, removeUserMedia } from '@/lib/actions/captureActions';

import { Button } from '../ui/button';
import { ButtonLoadingState, LoadingButton } from '../ui/button-loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import EpisodeListItem from './episode_list_item';
import PodcastListItem from './podcast_list_item';
import PodcastSearchResult, { Podcast } from './podcast_search_result';

type ImportPodcastProps = {
  importPodcast: (url: string) => void;
};

const ImportPodcast: FC<ImportPodcastProps> = ({ importPodcast }) => {
  const { media } = useUserContext();
  const [podcasts, setPodcasts] = useState<BaseMedia[] | NewMedia[]>(media ?? []);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Podcast[]>([]);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [searchButtonState, setSearchButtonState] = useState<ButtonLoadingState>('default');
  const [error, setError] = useState<string | null>(null);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm) return;
    setSearchButtonState('loading');
    setError(null);
    try {
      const res = await fetch(`/api/podcast_search?term=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch podcasts');
      }
      const data = await res.json();
      data.results.length === 0 ? setNoResults(true) : setNoResults(false);

      setResults(data.results || []);
      setSearchButtonState('default');
    } catch (err: any) {
      setError(err.message);
      setSearchButtonState('error');
    }
  };

  const loadPodcastList = async (inputValue: string) => {
    setLoading(true);
    await fetch(`/api/podcasts?url=${inputValue}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEpisodes(data.episodes);
        if (data && !podcasts.find((podcast) => podcast.title === data.title)) {
          const newPodcast = {
            title: data.title,
            description: data.description,
            imageUrl: data?.imageUrl ?? '',
            mediaUrl: data.mediaUrl,
          };
          addUserMedia(newPodcast);
          setPodcasts([newPodcast, ...podcasts]);
        }
      })
      .catch((error) => {
        throw new Error(`Failed to load podcast list: ${error}`);
      });
    setLoading(false);
  };

  const handlePodcastSelect = async (feed: string) => {
    setInputValue(feed);
    setResults([]);
    setEpisodes([]);
    await loadPodcastList(feed);
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

      <DialogContent className="flex flex-col max-w-[425px]  max-h-[90%] md:max-h-[70%] h-full">
        <DialogHeader>
          <DialogTitle>Import a podcast</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for a podcast..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {results.length === 0 ? (
            <LoadingButton
              type="submit"
              text="Search"
              loadingText="Searching..."
              errorText="Error"
              successText="Success"
              buttonState={searchButtonState}
              setButtonState={setSearchButtonState}
              reset
            />
          ) : (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setResults([]);
                setNoResults(false);
              }}
            >
              Clear
            </Button>
          )}
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {noResults && <p className=" my-2 text-center ">No results found</p>}
        {results.length > 0 && (
          <ul className="flex flex-col mt-4 gap-3 overflow-y-scroll">
            {results.map((podcast) => (
              <li key={podcast.collectionId}>
                <PodcastSearchResult podcast={podcast} handlePodcastSelect={handlePodcastSelect} />
              </li>
            ))}
          </ul>
        )}
        {results.length === 0 && (
          <div className="flex gap-2 items-center">
            <Input
              name="link"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter podcast url"
            />{' '}
            <Button onClick={() => loadPodcastList(inputValue)}>Load</Button>
          </div>
        )}
        <Separator />
        <div className="w-full overflow-x-scroll min-h-fit ">
          <div className="flex flex-row gap-3 w-fit  overflow-x-scroll">
            {podcasts?.map((podcast) => (
              <PodcastListItem
                key={podcast.id}
                podcast={podcast}
                handlePodcastSelect={handlePodcastSelect}
                removePodcast={removePodcast}
              />
            ))}
          </div>
        </div>
        <div className="col-span-2 h-full flex flex-col overflow-y-auto">
          {loading && <p>Loading...</p>}
          {episodes.length > 0 && (
            <div className=" gap-2">
              {episodes.map((episode, i) => (
                <EpisodeListItem key={i} episode={episode} setEpisodeURL={setEpisodeURL} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPodcast;

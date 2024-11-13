import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

interface PodcastEpisode {
  title: string;
  description: string;
  imageURL: string;
  audioURL: string;
  date: string;
}

interface Podcast {
  title: string;
  description: string;
  imageURL?: string;
  episodes: PodcastEpisode[];
}

export async function GET(request: NextRequest) {
  const rssFeedUrl = request.nextUrl.searchParams.get('url') || '';

  async function fetchAndParseRSSFeed(): Promise<Podcast | null> {
    const parser = new XMLParser({ ignoreAttributes: false });
    try {
      const response = await fetch(rssFeedUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rssText = await response.text();

      const jsonObj = parser.parse(rssText);
      if (!jsonObj.rss || !jsonObj.rss.channel) {
        throw new Error('Invalid RSS feed format.');
      }

      const channel = jsonObj.rss.channel;

      const podcastInfo: Podcast = {
        title: channel.title,
        description: channel.description,
        imageURL: channel?.image?.url ?? '',
        episodes: [],
      };

      // Normalize to array if only one item exists
      const items = Array.isArray(channel.item) ? channel.item : [channel.item];

      items.forEach((item: any) => {
        const episodeImage = item['itunes:image']?.['@_href'] ?? podcastInfo.imageURL;
        const audioURL = item.enclosure?.['@_url'] ?? item.link;

        const episode: PodcastEpisode = {
          title: item.title,
          description: item.description || item['itunes:summary'] || '',
          imageURL: episodeImage,
          audioURL,
          date: item['dc:date'] || item.pubDate,
        };

        podcastInfo.episodes.push(episode);
      });

      return podcastInfo;
    } catch (error) {
      console.error('Error fetching or parsing RSS feed:', error);
    }

    return null;
  }
  const result = await fetchAndParseRSSFeed();
  return NextResponse.json(result);
}

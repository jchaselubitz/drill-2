import { XMLParser } from 'fast-xml-parser';
import { Podcast } from 'kysely-codegen';

export async function fetchAndParseRSSFeed(feedUrl: string): Promise<Podcast | null> {
  const parser = new XMLParser({ ignoreAttributes: false });
  try {
    const response = await fetch(feedUrl);
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

    return podcastInfo;
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
  }
  return null;
}

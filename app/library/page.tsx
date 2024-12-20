import { getPhrases } from '@/lib/actions/phraseActions';

import LibraryLayout from './library_layout';

export default async function Library() {
  const phrases = await getPhrases({ source: undefined });

  return <LibraryLayout phrases={phrases} />;
}

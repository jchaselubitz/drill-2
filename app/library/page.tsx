import { getPhrases } from '@/lib/actions/phraseActions';

import LibraryLayout from './library_layout';

export default async function Library() {
  const phrases = await getPhrases();

  return <LibraryLayout phrases={phrases} />;
}

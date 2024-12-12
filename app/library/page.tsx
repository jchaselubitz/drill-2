import { getPhrases } from '@/lib/actions/phraseActions';

import LibraryLayout from './library_layout';

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ phrase: string }>;
}) {
  const phrases = await getPhrases();
  const { phrase } = await searchParams;

  return <LibraryLayout phrases={phrases} />;
}

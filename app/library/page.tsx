import { getPhrases } from '@/lib/actions/phraseActions';

import ResponsiveLayout from '../responsive_layout';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ phrase: string }>;
}) {
  const phrases = await getPhrases();
  const { phrase } = await searchParams;

  return <ResponsiveLayout phrases={phrases} openPhrase={phrase} />;
}

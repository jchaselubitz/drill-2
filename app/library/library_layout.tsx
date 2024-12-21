'use client';

import { PhraseWithAssociations } from 'kysely-codegen';
import { useMemo } from 'react';
import { useLibraryContext } from '@/contexts/library_context';

import ResponsiveLayout from '../responsive_layout';
import LibraryPhrasePanel from './(components)/library_phrase_panel';
import LibraryTable from './(components)/library_table';

interface LibraryLayoutProps {
  phrases: PhraseWithAssociations[];
}

export default function LibraryLayout({ phrases }: LibraryLayoutProps) {
  const { selectedPhraseId } = useLibraryContext();
  const userTags = [...new Set(phrases.flatMap((phrase) => phrase.tags.map((tag) => tag.label)))];

  const memoizedPhrase = useMemo(() => {
    if (!selectedPhraseId) return null;
    return phrases.find((p) => p.id === selectedPhraseId.toString()) ?? null;
  }, [selectedPhraseId, phrases]);

  return (
    <ResponsiveLayout
      detailPanelActive={!!selectedPhraseId}
      panel1={<LibraryTable phrases={phrases} />}
      panel2={<LibraryPhrasePanel phrase={memoizedPhrase} userTags={userTags} />}
    />
  );
}

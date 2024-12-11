'use client';

import { PhraseWithAssociations } from 'kysely-codegen';

import { useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import TopNav from './(components)/top_nav';
import LibraryPhrasePanel from './library/(components)/library_phrase_panel';
import LibraryTable from './library/(components)/library_table';
import { LibraryContextProvider, useLibraryContext } from './library/LibraryContext';

function _ResponsiveLayout({ phrases }: { phrases: PhraseWithAssociations[] }) {
  const { selectedPhraseId } = useLibraryContext();
  const isMobile = useWindowSize().width < 768;
  const userTags = [...new Set(phrases.flatMap((phrase) => phrase.tags.map((tag) => tag.label)))];

  return isMobile ? (
    <div className="min-h-screen  w-full">
      <main className="flex flex-col gap-8 md:items-center w-full h-full">
        {selectedPhraseId ? (
          <LibraryPhrasePanel phrases={phrases} setOptPhraseData={() => {}} userTags={userTags} />
        ) : (
          <LibraryTable className="p-2 pb-24" phrases={phrases} />
        )}
      </main>
    </div>
  ) : (
    <div className="max-h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <TopNav isMobile={false} />
          <div className="flex h-full items-center justify-center p-6 pt-40 pb-12 overflow-y-scroll">
            <LibraryTable phrases={phrases} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full overflow-y-scroll">
            <LibraryPhrasePanel phrases={phrases} setOptPhraseData={() => {}} userTags={userTags} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function ResponsiveLayout({
  phrases,
  openPhrase,
}: {
  phrases: PhraseWithAssociations[];
  openPhrase: string | null;
}) {
  return (
    <LibraryContextProvider openPhrase={openPhrase}>
      <_ResponsiveLayout phrases={phrases} />
    </LibraryContextProvider>
  );
}

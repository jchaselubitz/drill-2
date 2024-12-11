'use client';

import { PhraseWithAssociations } from 'kysely-codegen';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useWindowSize } from 'react-use';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import TopNav from './(components)/top_nav';
import LibraryPhrase from './library/(components)/library_phrase';
import LibraryPhrasePanel from './library/(components)/library_phrase_panel';
import LibraryTable from './library/(components)/library_table';

export default function ResponsiveLayout({
  phrases,
  openPhrase,
}: {
  phrases: PhraseWithAssociations[];
  openPhrase: string;
}) {
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(openPhrase);
  const router = useRouter();
  const isMobile = useWindowSize().width < 768;
  const userTags = [...new Set(phrases.flatMap((phrase) => phrase.tags.map((tag) => tag.label)))];

  const memoizedPhrase = useMemo(() => {
    return phrases.find((p) => p.id === selectedPhraseId) ?? null;
  }, [selectedPhraseId, phrases]);

  const selectPhrase = (id: string | null) => {
    setSelectedPhraseId(id);
    if (id === null) {
      router.push('/library');
    } else router.push(`?phrase=${id}`);
  };

  return isMobile ? (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-8 md:items-center w-full">
        {memoizedPhrase ? (
          <LibraryPhrase
            phrase={memoizedPhrase}
            isMobile={isMobile}
            setOptPhraseData={() => {}}
            userTags={userTags}
            setSelectedPhraseId={selectPhrase}
          />
        ) : (
          <LibraryTable
            phrases={phrases}
            openPhrase={openPhrase}
            setSelectedPhraseId={selectPhrase}
          />
        )}
      </main>
    </div>
  ) : (
    <div className="max-h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <TopNav isMobile={false} />
          <div className="flex h-full items-center justify-center p-6 pt-32 overflow-y-scroll">
            <LibraryTable
              phrases={phrases}
              openPhrase={openPhrase}
              setSelectedPhraseId={selectPhrase}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          {memoizedPhrase ? (
            <LibraryPhrasePanel
              phrase={memoizedPhrase}
              setOptPhraseData={() => {}}
              userTags={userTags}
              setSelectedPhraseId={selectPhrase}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">Select a phrase to view details</div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

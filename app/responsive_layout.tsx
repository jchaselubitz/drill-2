'use client';

import { useWindowSize } from 'react-use';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';

import TopNav from './(components)/top_nav';

interface ResponsiveLayoutProps {
  panel2: React.ReactNode;
  panel1: React.ReactNode;
  detailPanelActive: boolean;
}

export default function ResponsiveLayout({
  panel2,
  panel1,
  detailPanelActive,
}: ResponsiveLayoutProps) {
  const isMobile = useWindowSize().width < 768;

  return isMobile ? (
    <div className="min-h-screen  w-full">
      <main className="flex flex-col gap-8  w-full h-full">
        {detailPanelActive ? (
          <ScrollArea className="flex h-full">{panel2}</ScrollArea>
        ) : (
          <ScrollArea className="p-2 pb-24">{panel1}</ScrollArea>
        )}
      </main>
    </div>
  ) : (
    <div className="max-h-screen min-h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} className="pb-14">
          <TopNav isMobile={false} />
          <ScrollArea className="flex h-full justify-center px-4">{panel1}</ScrollArea>
          {/* <div className="flex h-full justify-center px-4 overflow-y-scroll">{panel1}</div> */}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="pb-14">
          <ScrollArea className="flex h-full">{panel2}</ScrollArea>
          {/* <div className="flex h-full overflow-y-scroll">{panel2}</div> */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

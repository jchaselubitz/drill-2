'use client';

import { useWindowSize } from 'react-use';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import TopNav from './(components)/top_nav';

interface ResponsiveLayoutProps {
  panel1: React.ReactNode;
  panel2: React.ReactNode;
  detailPanelActive: boolean;
}

export default function ResponsiveLayout({
  panel1,
  panel2,
  detailPanelActive,
}: ResponsiveLayoutProps) {
  const isMobile = useWindowSize().width < 768;

  return isMobile ? (
    <div className="min-h-screen  w-full">
      <main className="flex flex-col gap-8  w-full h-full">
        {detailPanelActive ? (
          <div className="flex h-full overflow-y-scroll">{panel2}</div>
        ) : (
          <div className="p-2 pb-24 overflow-y-scroll">{panel1}</div>
        )}
      </main>
    </div>
  ) : (
    <div className="max-h-screen min-h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} className="pb-14">
          <TopNav isMobile={false} />
          <div className="h-full w-full px-4 overflow-y-scroll">{panel1}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="pb-14">
          <div className="flex h-full w-full overflow-y-scroll">{panel2}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

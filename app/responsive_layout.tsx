'use client';

import { useWindowSize } from 'react-use';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ErrorBoundary } from '@/components/error_boundary';

import TopNav from './(components)/top_nav';

interface ResponsiveLayoutProps {
  panel1: React.ReactNode;
  panel2: React.ReactNode;
  detailPanelActive: boolean;
}

function ResponsiveLayoutContent({ panel1, panel2, detailPanelActive }: ResponsiveLayoutProps) {
  const isMobile = useWindowSize().width < 768;

  return isMobile ? (
    <div className="min-h-screen  w-full">
      <main className="flex flex-col gap-8 w-full h-full">
        {detailPanelActive ? (
          <div className="flex  pb-24 h-full overflow-y-scroll">
            <ErrorBoundary>{panel2}</ErrorBoundary>
          </div>
        ) : (
          <div className="p-2 pb-24 mt-2 overflow-y-scroll">
            <ErrorBoundary>{panel1}</ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  ) : (
    <div className="max-h-screen min-h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} className="pb-14">
          <TopNav isMobile={false} />
          <div className="h-full w-full px-4 overflow-y-scroll">
            <ErrorBoundary>{panel1}</ErrorBoundary>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="">
          <div className="flex h-full w-full overflow-y-scroll">
            <ErrorBoundary>{panel2}</ErrorBoundary>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function ResponsiveLayout(props: ResponsiveLayoutProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Layout Error</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the layout. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <ResponsiveLayoutContent {...props} />
    </ErrorBoundary>
  );
}

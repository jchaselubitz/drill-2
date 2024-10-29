'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import userPanelSetting from '@/lib/utils/userPanelSetting';
import { cn } from '@/lib/utils';
import { ImperativePanelHandle } from 'react-resizable-panels';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
interface ResizableLayoutProps {
  organizationId: string;
  children: React.ReactNode;
  userMenu: React.ReactNode;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  organizationId,
  children,
  userMenu,
}) => {
  const windowSize = useWindowSize();
  const isMobile = useWindowSize().width < 768;

  const { storedDefault, handleResize } = userPanelSetting(undefined, 'sidebar_width');

  const getSizes = () => {
    let collapsedSize;
    if (windowSize.width < 650) {
      collapsedSize = 0;
    } else if (windowSize.width < 768) {
      collapsedSize = 10;
    } else if (windowSize.width < 1024) {
      collapsedSize = 7;
    } else if (windowSize.width < 1290) {
      collapsedSize = 5;
    } else {
      collapsedSize = 4;
    }

    let defaultSize;
    if (storedDefault) {
      defaultSize = storedDefault as number;
    } else if (windowSize.width < 650) {
      defaultSize = collapsedSize;
    } else if (windowSize.width < 768) {
      defaultSize = 20;
    } else if (windowSize.width < 1024) {
      defaultSize = 15;
    } else {
      defaultSize = 13;
    }

    let minSize;
    if (windowSize.width < 650) {
      minSize = collapsedSize;
    } else if (windowSize.width < 768) {
      minSize = 20;
    } else if (windowSize.width < 1024) {
      minSize = 18;
    } else {
      minSize = 15;
    }

    let maxSize;
    if (windowSize.width < 650) {
      maxSize = 25;
    } else if (windowSize.width < 768) {
      maxSize = 25;
    } else if (windowSize.width < 1024) {
      maxSize = 23;
    } else {
      maxSize = 20;
    }
    return { collapsedSize, defaultSize, minSize, maxSize };
  };

  const sizes = getSizes();
  const { collapsedSize, defaultSize, minSize, maxSize } = sizes;

  const [isCollapsed, setIsCollapsed] = useState(true);
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);

  const toggleCollapsed = () => {
    if (sidebarPanelRef.current && sidebarPanelRef.current.expand) {
      isCollapsed ? sidebarPanelRef.current.expand() : sidebarPanelRef.current.collapse();
    }
  };

  return (
    <>
      {isMobile ? (
        <div className="pb-24">
          {children}
          <div className="fixed flex items-center bottom-0 w-full bg-white p-3">
            <Sidebar
              organizationId={organizationId}
              isCollapsed={true}
              orientation="horizontal"
              toggleCollapsed={toggleCollapsed}
              userMenu={userMenu}
            />
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            id="sidebar"
            order={1}
            defaultSize={defaultSize}
            minSize={minSize}
            maxSize={maxSize}
            collapsible
            collapsedSize={collapsedSize}
            onCollapse={() => setIsCollapsed(true)}
            onExpand={() => setIsCollapsed(false)}
            onResize={(size) => handleResize(size)}
            ref={sidebarPanelRef}
            className={cn('min-w-16 items-center', isCollapsed && 'max-w-16')}
          >
            <Sidebar>
              <SidebarHeader />
              <SidebarContent>
                <SidebarGroup />
                <SidebarGroup />
              </SidebarContent>
              <SidebarFooter />
            </Sidebar>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={100 - defaultSize} order={2}>
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </>
  );
};

export default ResizableLayout;

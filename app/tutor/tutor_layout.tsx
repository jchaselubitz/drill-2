'use client';

import ResponsiveLayout from '../responsive_layout';

interface TutorLayoutProps {
  topic: React.ReactNode;
  children: React.ReactNode;
}

export default function ResponsiveTutorLayout({ topic, children }: TutorLayoutProps) {
  return (
    <ResponsiveLayout
      detailPanelActive={!!topic}
      panel1={children}
      panel2={<div className="px-4 w-full">{topic}</div>}
    />
  );
}

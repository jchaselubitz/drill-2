'use client';

import { useParams } from 'next/navigation';

import ResponsiveLayout from '../responsive_layout';

interface TutorLayoutProps {
  topic: React.ReactNode;
  children: React.ReactNode;
}

export default function ResponsiveTutorLayout({ topic, children }: TutorLayoutProps) {
  const topicSelected = useParams().topicId;
  return (
    <ResponsiveLayout
      detailPanelActive={!!topicSelected}
      panel1={<div className="py-4 w-full">{children}</div>}
      panel2={<div className="w-full">{topic}</div>}
    />
  );
}

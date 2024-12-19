import { TutorContextProvider } from '@/contexts/tutor_context';

import ResponsiveTutorLayout from './tutor_layout';

export default async function TutorBaseLayout({
  children,
  topic,
}: Readonly<{
  children: React.ReactNode;
  topic: React.ReactNode;
}>) {
  return (
    <TutorContextProvider>
      <ResponsiveTutorLayout topic={topic}>{children}</ResponsiveTutorLayout>
    </TutorContextProvider>
  );
}

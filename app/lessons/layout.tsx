//   return (
//     <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
//       <main className="flex flex-col gap-8 md:items-center w-full">
//         <Accordion type="multiple" className="flex flex-col items-center gap-4 w-full">
//           {subjects.map((subject: any) => (
//             <SubjectItem key={subject.id} subject={subject} />
//           ))}
//         </Accordion>
//         <Link href="/lessons/create">
//           <Button className="w-full">Create a new subject</Button>
//         </Link>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
//     </div>
//   );
// }

import { LessonsContextProvider } from '@/contexts/lessons_context';

export default async function LessonsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

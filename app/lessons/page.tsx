import SubjectItem from '@/components/lessons/subject_item';
import { Accordion } from '@/components/ui/accordion';
import { getSubjects } from '@/lib/actions/lessonActions';

export default async function Home() {
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-8 md:items-center w-full">
        <Accordion type="multiple" className="flex flex-col items-center gap-4 w-full">
          {subjects.map((subject: any) => (
            <SubjectItem key={subject.id} subject={subject} />
          ))}
        </Accordion>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
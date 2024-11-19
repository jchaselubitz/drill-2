import { getPhrases } from '@/lib/actions/phraseActions';

import LibraryTable from './(components)/library_table';

export default async function Home() {
  const phrases = await getPhrases();
  console.log(phrases[0].tags);

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-8 md:items-center w-full">
        <LibraryTable phrases={phrases} />
      </main>
      {/* <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer> */}
    </div>
  );
}

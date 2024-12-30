import { getUserHistory } from '@/lib/actions/actionsHistory';

export default async function Settings() {
  const histories = await getUserHistory();

  return (
    <div className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <main className="flex flex-col gap-4 md:items-center w-full ">
        {histories.map((h) => {
          return (
            <div key={h.id} className="flex flex-col gap-4">
              <div className="flex flex-row gap-4">
                <div className="font-semibold">Insights:</div>
                <div>{h.insights}</div>
              </div>
              <div className="flex flex-row gap-4">
                <div className="font-semibold">Concepts:</div>
                <div>{h.concepts}</div>
              </div>
              <div className="flex flex-row gap-4">
                <div className="font-semibold">Vocab:</div>
                <div>
                  {h.vocabulary.map((word, i) => {
                    return (
                      <div key={i} className="font-semibold">
                        {word.word}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

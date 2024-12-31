import HistoryPhraseItem from '@/components/history/history_phrase_item';
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
                <div>
                  {h.concepts?.map((c) => {
                    return (
                      <div key={c} className="font-semibold">
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <div className="font-semibold">Vocab:</div>
                <div className="flex flex-col gap-3">
                  {h.vocabulary.map((word) => {
                    return <HistoryPhraseItem key={word.id} word={word} />;
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

import HistoryPhraseItem from '@/components/history/history_phrase_item';
import { Separator } from '@/components/ui/separator';
import { getUserHistory } from '@/lib/actions/actionsHistory';
import { getProfile } from '@/lib/actions/userActions';
import { createClient } from '@/utils/supabase/server';

import { ProfileForm } from './(components)/profile-form';
import { SecuritySettings } from './(components)/security_settings';

export default async function Settings() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasPassword = user?.user_metadata.has_password;
  const providers = user?.identities?.map((i) => i.provider);

  const userEmail = user?.email;
  const profile = await getProfile();
  const histories = await getUserHistory();

  return (
    <main className="min-h-screen md:p-4 pb-20 gap-16 p-2 w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="border p-4 rounded-lg w-full h-fit">
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            This is how others will see you on the site.
          </p>

          <Separator className="my-4" />
          {profile && <ProfileForm profile={profile} />}
        </div>
        <div className="border p-4 rounded-lg w-full h-fit">
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            {`Security settings for account: ${userEmail}`}.
          </p>

          <Separator className="my-4" />
          <SecuritySettings hasPassword={hasPassword} userEmail={userEmail} />
        </div>
      </div>
      <div className="pt-10">
        <h3 className="text-xl font-medium">History</h3>
        <p className="text-sm text-muted-foreground">
          {`Learning history and settings for: ${userEmail}`}.
        </p>{' '}
      </div>
      <Separator className="my-4" />
      {histories.map((h) => {
        return (
          <div key={h.id} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="border p-4 rounded-lg md:w-1/2 h-fit min-w-fit flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold">Concepts</h4>
                  <p className="text-sm text-muted-foreground">
                    Drill AI will automatically maintain this list.
                  </p>
                </div>
                <div>
                  {h.concepts?.map((c: string) => {
                    return (
                      <div key={c} className="font-medium">
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border p-4 rounded-lg w-full h-fit flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold">Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Drill AI will automatically update this summary of your learning status.
                  </p>
                </div>
                <div>{h.insights}</div>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <div>
                <h3 className="text-xl font-medium">Vocabulary</h3>
                <p className="text-sm text-muted-foreground">
                  Words that Drill AI thinks you should practice.
                </p>
              </div>
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
  );
}

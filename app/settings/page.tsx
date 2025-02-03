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
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            This is how others will see you on the site.
          </p>
        </div>
        <Separator />
        {profile && <ProfileForm profile={profile} />}
        <div className="pt-10">
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            {`Security settings for account: ${userEmail}`}.
          </p>
        </div>
        <Separator />
        <SecuritySettings hasPassword={hasPassword} providers={providers} />

        <div className="pt-10">
          <h3 className="text-lg font-medium">History</h3>
          <p className="text-sm text-muted-foreground">
            {`Learning history and settings for: ${userEmail}`}.
          </p>{' '}
        </div>
        <Separator />
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
      </div>
    </main>
  );
}

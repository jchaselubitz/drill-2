drop policy "Enable delete for users based on user_id" on "public"."subjects";
drop policy "Enable insert for users based on user_id" on "public"."subjects";
drop policy "Enable update for users based on user_id" on "public"."subjects";
create policy "Enable ALL for users based on user_id"
on "public"."subjects"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

drop policy "Enable delete for users based on user_id" on "public"."cards";
drop policy "Enable insert for users based on user_id" on "public"."cards";
drop policy "Enable update for users based on user_id" on "public"."cards";
drop policy "Enable delete for users based on user_id" on "public"."lessons";
drop policy "Enable insert for users based on user_id" on "public"."lessons";
drop policy "Enable update for users based on user_id" on "public"."lessons";
create policy "Enable ALL for users based on user_id"
on "public"."cards"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));
create policy "Enable ALL for users based on user_id"
on "public"."lessons"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

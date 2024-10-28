create policy "Enable delete for users based on user_id"
on "public"."cards"
as permissive
for delete
to public
using ((auth.uid() = user_id));
create policy "Enable insert for users based on user_id"
on "public"."cards"
as permissive
for insert
to public
with check (true);
create policy "Enable update for users based on user_id"
on "public"."cards"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));
create policy "Enable delete for users based on user_id"
on "public"."lessons"
as permissive
for delete
to public
using ((auth.uid() = user_id));
create policy "Enable insert for users based on user_id"
on "public"."lessons"
as permissive
for insert
to public
with check (true);
create policy "Enable update for users based on user_id"
on "public"."lessons"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));
create policy "Enable delete for users based on user_id"
on "public"."subjects"
as permissive
for delete
to public
using ((auth.uid() = user_id));
create policy "Enable insert for users based on user_id"
on "public"."subjects"
as permissive
for insert
to public
with check (true);
create policy "Enable update for users based on user_id"
on "public"."subjects"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

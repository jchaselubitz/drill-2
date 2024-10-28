drop policy "Enable insert for users based on user_id" on "public"."subjects";
create policy "Enable insert for users based on user_id"
on "public"."subjects"
as permissive
for insert
to authenticated
with check (true);

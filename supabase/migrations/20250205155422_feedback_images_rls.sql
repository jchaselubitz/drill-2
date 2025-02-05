create policy "Users can SELECT and INSERT 1d1lroy_0"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'feedback_images'::text));


create policy "Users can SELECT and INSERT 1d1lroy_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'feedback_images'::text));




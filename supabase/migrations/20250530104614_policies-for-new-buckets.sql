create policy "Anyone can SELECT text-to-speech"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'text-to-speech'::text));


create policy "Users have SELECT access to own folder user-recordings"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'user-recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Users have INSERT access to own folder user-recordings"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'user-recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Users have UPDATE access to own folder user-recordings"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'user-recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Users have DELETE access to own folder user-recordings"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'user-recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "only authenticated can INSERT text-to-speech"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'text-to-speech'::text) AND (auth.role() = 'authenticated'::text)));

create policy "All can SELECT user-images"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'user-images'::text));


create policy "Authenticated can INSERT user-images"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'user-images'::text) AND (auth.role() = 'authenticated'::text)));



create policy "Users can SELECT feedback-images"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'feedback-images'::text));


create policy "Users can INSERT feedback-images"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'feedback-images'::text));




create policy "Anyone can SELECT 1m9smms_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'text_to_speech'::text));


create policy "Users have ALL access to own folder y8tnrq_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'user_recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Users have ALL access to own folder y8tnrq_1"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'user_recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Users have ALL access to own folder y8tnrq_2"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'user_recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Users have ALL access to own folder y8tnrq_3"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'user_recordings'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "only authenticated can INSERT"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'text_to_speech'::text) AND (auth.role() = 'authenticated'::text)));




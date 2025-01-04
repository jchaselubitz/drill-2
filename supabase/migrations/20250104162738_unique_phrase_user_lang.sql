alter table "public"."phrase" drop constraint "unique_phrase_user_lang_part";

drop index if exists "public"."unique_phrase_user_lang_part";

CREATE UNIQUE INDEX unique_phrase_user_lang ON public.phrase USING btree (text, user_id, lang);

alter table "public"."phrase" add constraint "unique_phrase_user_lang" UNIQUE using index "unique_phrase_user_lang";



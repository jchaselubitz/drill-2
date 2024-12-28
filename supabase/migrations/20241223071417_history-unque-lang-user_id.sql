CREATE UNIQUE INDEX history_lang_user_id_unique ON public.history USING btree (lang, user_id);

alter table "public"."history" add constraint "history_lang_user_id_unique" UNIQUE using index "history_lang_user_id_unique";



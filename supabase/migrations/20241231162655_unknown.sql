alter table "public"."history" drop column "vocabulary";

alter table "public"."phrase" add column "difficulty" smallint;

alter table "public"."phrase" add column "history_id" bigint;

CREATE UNIQUE INDEX unique_phrase_user_lang_part ON public.phrase USING btree (text, user_id, lang, part_speech);

alter table "public"."phrase" add constraint "phrase_difficulty_check" CHECK ((difficulty < 4)) not valid;

alter table "public"."phrase" validate constraint "phrase_difficulty_check";

alter table "public"."phrase" add constraint "phrase_history_id_fkey" FOREIGN KEY (history_id) REFERENCES history(id) ON DELETE SET NULL not valid;

alter table "public"."phrase" validate constraint "phrase_history_id_fkey";

alter table "public"."phrase" add constraint "unique_phrase_user_lang_part" UNIQUE using index "unique_phrase_user_lang_part";



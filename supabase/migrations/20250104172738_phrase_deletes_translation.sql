alter table "public"."translation" drop constraint "translations_phrase_primary_id_fkey";

alter table "public"."translation" drop constraint "translations_phrase_secondary_id_fkey";

alter table "public"."translation" add constraint "translation_phrase_primary_id_fkey" FOREIGN KEY (phrase_primary_id) REFERENCES phrase(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."translation" validate constraint "translation_phrase_primary_id_fkey";

alter table "public"."translation" add constraint "translation_phrase_secondary_id_fkey" FOREIGN KEY (phrase_secondary_id) REFERENCES phrase(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."translation" validate constraint "translation_phrase_secondary_id_fkey";



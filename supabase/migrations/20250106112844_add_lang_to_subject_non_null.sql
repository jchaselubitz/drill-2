alter table "public"."subject" alter column "lang" set default 'de'::iso_639_language_code;

alter table "public"."subject" alter column "lang" set not null;



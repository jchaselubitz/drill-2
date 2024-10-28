alter table "public"."profile" drop column "perf_language";

alter table "public"."profile" add column "pref_language" iso_639_language_code;



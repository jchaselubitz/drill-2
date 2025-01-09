alter table "public"."lesson" add column "side_one" iso_639_language_code not null default 'en'::iso_639_language_code;

alter table "public"."lesson" add column "side_two" iso_639_language_code not null default 'de'::iso_639_language_code;

alter table "public"."phrase" alter column "lang" set data type iso_639_language_code using "lang"::iso_639_language_code;



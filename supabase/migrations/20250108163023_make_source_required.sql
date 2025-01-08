alter table "public"."phrase" alter column "source" set default 'home'::text;

alter table "public"."phrase" alter column "source" set not null;



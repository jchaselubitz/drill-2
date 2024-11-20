create type "public"."phrase_type" as enum ('word', 'phrase', 'recording');

drop policy "Enable ALL for users based on user_id" on "public"."recording";

revoke delete on table "public"."recording" from "anon";

revoke insert on table "public"."recording" from "anon";

revoke references on table "public"."recording" from "anon";

revoke select on table "public"."recording" from "anon";

revoke trigger on table "public"."recording" from "anon";

revoke truncate on table "public"."recording" from "anon";

revoke update on table "public"."recording" from "anon";

revoke delete on table "public"."recording" from "authenticated";

revoke insert on table "public"."recording" from "authenticated";

revoke references on table "public"."recording" from "authenticated";

revoke select on table "public"."recording" from "authenticated";

revoke trigger on table "public"."recording" from "authenticated";

revoke truncate on table "public"."recording" from "authenticated";

revoke update on table "public"."recording" from "authenticated";

revoke delete on table "public"."recording" from "service_role";

revoke insert on table "public"."recording" from "service_role";

revoke references on table "public"."recording" from "service_role";

revoke select on table "public"."recording" from "service_role";

revoke trigger on table "public"."recording" from "service_role";

revoke truncate on table "public"."recording" from "service_role";

revoke update on table "public"."recording" from "service_role";

alter table "public"."recording" drop constraint "recordings_pkey";

drop index if exists "public"."recordings_pkey";

drop table "public"."recording";

alter table "public"."phrase" add column "filename" text;

alter table "public"."phrase" add column "type" phrase_type not null default 'phrase'::phrase_type;



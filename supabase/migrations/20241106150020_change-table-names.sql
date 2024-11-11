drop policy "Enable ALL for users based on user_id" on "public"."lessons";

drop policy "Enable delete for users based on user_id" on "public"."phrases";

drop policy "Enable ALL for users based on user_id" on "public"."recordings";

drop policy "Enable ALL for users based on user_id" on "public"."subjects";

drop policy "Enable ALL for users based on user_id" on "public"."translations";

revoke delete on table "public"."lessons" from "anon";

revoke insert on table "public"."lessons" from "anon";

revoke references on table "public"."lessons" from "anon";

revoke select on table "public"."lessons" from "anon";

revoke trigger on table "public"."lessons" from "anon";

revoke truncate on table "public"."lessons" from "anon";

revoke update on table "public"."lessons" from "anon";

revoke delete on table "public"."lessons" from "authenticated";

revoke insert on table "public"."lessons" from "authenticated";

revoke references on table "public"."lessons" from "authenticated";

revoke select on table "public"."lessons" from "authenticated";

revoke trigger on table "public"."lessons" from "authenticated";

revoke truncate on table "public"."lessons" from "authenticated";

revoke update on table "public"."lessons" from "authenticated";

revoke delete on table "public"."lessons" from "service_role";

revoke insert on table "public"."lessons" from "service_role";

revoke references on table "public"."lessons" from "service_role";

revoke select on table "public"."lessons" from "service_role";

revoke trigger on table "public"."lessons" from "service_role";

revoke truncate on table "public"."lessons" from "service_role";

revoke update on table "public"."lessons" from "service_role";

revoke delete on table "public"."phrases" from "anon";

revoke insert on table "public"."phrases" from "anon";

revoke references on table "public"."phrases" from "anon";

revoke select on table "public"."phrases" from "anon";

revoke trigger on table "public"."phrases" from "anon";

revoke truncate on table "public"."phrases" from "anon";

revoke update on table "public"."phrases" from "anon";

revoke delete on table "public"."phrases" from "authenticated";

revoke insert on table "public"."phrases" from "authenticated";

revoke references on table "public"."phrases" from "authenticated";

revoke select on table "public"."phrases" from "authenticated";

revoke trigger on table "public"."phrases" from "authenticated";

revoke truncate on table "public"."phrases" from "authenticated";

revoke update on table "public"."phrases" from "authenticated";

revoke delete on table "public"."phrases" from "service_role";

revoke insert on table "public"."phrases" from "service_role";

revoke references on table "public"."phrases" from "service_role";

revoke select on table "public"."phrases" from "service_role";

revoke trigger on table "public"."phrases" from "service_role";

revoke truncate on table "public"."phrases" from "service_role";

revoke update on table "public"."phrases" from "service_role";

revoke delete on table "public"."recordings" from "anon";

revoke insert on table "public"."recordings" from "anon";

revoke references on table "public"."recordings" from "anon";

revoke select on table "public"."recordings" from "anon";

revoke trigger on table "public"."recordings" from "anon";

revoke truncate on table "public"."recordings" from "anon";

revoke update on table "public"."recordings" from "anon";

revoke delete on table "public"."recordings" from "authenticated";

revoke insert on table "public"."recordings" from "authenticated";

revoke references on table "public"."recordings" from "authenticated";

revoke select on table "public"."recordings" from "authenticated";

revoke trigger on table "public"."recordings" from "authenticated";

revoke truncate on table "public"."recordings" from "authenticated";

revoke update on table "public"."recordings" from "authenticated";

revoke delete on table "public"."recordings" from "service_role";

revoke insert on table "public"."recordings" from "service_role";

revoke references on table "public"."recordings" from "service_role";

revoke select on table "public"."recordings" from "service_role";

revoke trigger on table "public"."recordings" from "service_role";

revoke truncate on table "public"."recordings" from "service_role";

revoke update on table "public"."recordings" from "service_role";

revoke delete on table "public"."subjects" from "anon";

revoke insert on table "public"."subjects" from "anon";

revoke references on table "public"."subjects" from "anon";

revoke select on table "public"."subjects" from "anon";

revoke trigger on table "public"."subjects" from "anon";

revoke truncate on table "public"."subjects" from "anon";

revoke update on table "public"."subjects" from "anon";

revoke delete on table "public"."subjects" from "authenticated";

revoke insert on table "public"."subjects" from "authenticated";

revoke references on table "public"."subjects" from "authenticated";

revoke select on table "public"."subjects" from "authenticated";

revoke trigger on table "public"."subjects" from "authenticated";

revoke truncate on table "public"."subjects" from "authenticated";

revoke update on table "public"."subjects" from "authenticated";

revoke delete on table "public"."subjects" from "service_role";

revoke insert on table "public"."subjects" from "service_role";

revoke references on table "public"."subjects" from "service_role";

revoke select on table "public"."subjects" from "service_role";

revoke trigger on table "public"."subjects" from "service_role";

revoke truncate on table "public"."subjects" from "service_role";

revoke update on table "public"."subjects" from "service_role";

revoke delete on table "public"."translations" from "anon";

revoke insert on table "public"."translations" from "anon";

revoke references on table "public"."translations" from "anon";

revoke select on table "public"."translations" from "anon";

revoke trigger on table "public"."translations" from "anon";

revoke truncate on table "public"."translations" from "anon";

revoke update on table "public"."translations" from "anon";

revoke delete on table "public"."translations" from "authenticated";

revoke insert on table "public"."translations" from "authenticated";

revoke references on table "public"."translations" from "authenticated";

revoke select on table "public"."translations" from "authenticated";

revoke trigger on table "public"."translations" from "authenticated";

revoke truncate on table "public"."translations" from "authenticated";

revoke update on table "public"."translations" from "authenticated";

revoke delete on table "public"."translations" from "service_role";

revoke insert on table "public"."translations" from "service_role";

revoke references on table "public"."translations" from "service_role";

revoke select on table "public"."translations" from "service_role";

revoke trigger on table "public"."translations" from "service_role";

revoke truncate on table "public"."translations" from "service_role";

revoke update on table "public"."translations" from "service_role";

alter table "public"."lessons" drop constraint "lessons_subject_id_fkey";

alter table "public"."lessons" drop constraint "lessons_user_id_fkey";

alter table "public"."translations" drop constraint "translations_lesson_id_fkey";

alter table "public"."translations" drop constraint "translations_phrase_primary_id_fkey";

alter table "public"."translations" drop constraint "translations_phrase_secondary_id_fkey";

alter table "public"."translations" drop constraint "translations_user_id_fkey";

alter table "public"."lessons" drop constraint "lessons_pkey";

alter table "public"."phrases" drop constraint "phrases_pkey";

alter table "public"."recordings" drop constraint "recordings_pkey";

alter table "public"."subjects" drop constraint "subjects_pkey";

alter table "public"."translations" drop constraint "cards_pkey";

drop index if exists "public"."cards_pkey";

drop index if exists "public"."lessons_pkey";

drop index if exists "public"."phrases_pkey";

drop index if exists "public"."recordings_pkey";

drop index if exists "public"."subjects_pkey";

drop table "public"."lessons";

drop table "public"."phrases";

drop table "public"."recordings";

drop table "public"."subjects";

drop table "public"."translations";

create table "public"."lesson" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "subject_id" bigint not null,
    "title" text not null,
    "short_description" text,
    "recording_url" text,
    "content" text,
    "show_side_2_first" boolean,
    "review_date" timestamp with time zone,
    "review_deck" jsonb[]
);


alter table "public"."lesson" enable row level security;

create table "public"."phrase" (
    "id" bigint generated by default as identity not null,
    "user_id" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "text" text,
    "lang" text,
    "source" text,
    "part_speech" text
);


alter table "public"."phrase" enable row level security;

create table "public"."recording" (
    "id" bigint generated by default as identity not null,
    "user_id" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "filename" text,
    "transcript" text,
    "lang" iso_639_language_code
);


alter table "public"."recording" enable row level security;

create table "public"."subject" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "current_level" text,
    "user_id" uuid default auth.uid()
);


alter table "public"."subject" enable row level security;

create table "public"."translation" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "lesson_id" bigint,
    "user_id" uuid not null,
    "interval_history" integer[],
    "repetition_history" timestamp with time zone[],
    "phrase_primary_id" bigint not null,
    "phrase_secondary_id" bigint not null
);


alter table "public"."translation" enable row level security;

CREATE UNIQUE INDEX cards_pkey ON public.translation USING btree (id);

CREATE UNIQUE INDEX lessons_pkey ON public.lesson USING btree (id);

CREATE UNIQUE INDEX phrases_pkey ON public.phrase USING btree (id);

CREATE UNIQUE INDEX recordings_pkey ON public.recording USING btree (id);

CREATE UNIQUE INDEX subjects_pkey ON public.subject USING btree (id);

alter table "public"."lesson" add constraint "lessons_pkey" PRIMARY KEY using index "lessons_pkey";

alter table "public"."phrase" add constraint "phrases_pkey" PRIMARY KEY using index "phrases_pkey";

alter table "public"."recording" add constraint "recordings_pkey" PRIMARY KEY using index "recordings_pkey";

alter table "public"."subject" add constraint "subjects_pkey" PRIMARY KEY using index "subjects_pkey";

alter table "public"."translation" add constraint "cards_pkey" PRIMARY KEY using index "cards_pkey";

alter table "public"."lesson" add constraint "lessons_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES subject(id) not valid;

alter table "public"."lesson" validate constraint "lessons_subject_id_fkey";

alter table "public"."lesson" add constraint "lessons_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."lesson" validate constraint "lessons_user_id_fkey";

alter table "public"."translation" add constraint "translations_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES lesson(id) not valid;

alter table "public"."translation" validate constraint "translations_lesson_id_fkey";

alter table "public"."translation" add constraint "translations_phrase_primary_id_fkey" FOREIGN KEY (phrase_primary_id) REFERENCES phrase(id) not valid;

alter table "public"."translation" validate constraint "translations_phrase_primary_id_fkey";

alter table "public"."translation" add constraint "translations_phrase_secondary_id_fkey" FOREIGN KEY (phrase_secondary_id) REFERENCES phrase(id) not valid;

alter table "public"."translation" validate constraint "translations_phrase_secondary_id_fkey";

alter table "public"."translation" add constraint "translations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."translation" validate constraint "translations_user_id_fkey";

grant delete on table "public"."lesson" to "anon";

grant insert on table "public"."lesson" to "anon";

grant references on table "public"."lesson" to "anon";

grant select on table "public"."lesson" to "anon";

grant trigger on table "public"."lesson" to "anon";

grant truncate on table "public"."lesson" to "anon";

grant update on table "public"."lesson" to "anon";

grant delete on table "public"."lesson" to "authenticated";

grant insert on table "public"."lesson" to "authenticated";

grant references on table "public"."lesson" to "authenticated";

grant select on table "public"."lesson" to "authenticated";

grant trigger on table "public"."lesson" to "authenticated";

grant truncate on table "public"."lesson" to "authenticated";

grant update on table "public"."lesson" to "authenticated";

grant delete on table "public"."lesson" to "service_role";

grant insert on table "public"."lesson" to "service_role";

grant references on table "public"."lesson" to "service_role";

grant select on table "public"."lesson" to "service_role";

grant trigger on table "public"."lesson" to "service_role";

grant truncate on table "public"."lesson" to "service_role";

grant update on table "public"."lesson" to "service_role";

grant delete on table "public"."phrase" to "anon";

grant insert on table "public"."phrase" to "anon";

grant references on table "public"."phrase" to "anon";

grant select on table "public"."phrase" to "anon";

grant trigger on table "public"."phrase" to "anon";

grant truncate on table "public"."phrase" to "anon";

grant update on table "public"."phrase" to "anon";

grant delete on table "public"."phrase" to "authenticated";

grant insert on table "public"."phrase" to "authenticated";

grant references on table "public"."phrase" to "authenticated";

grant select on table "public"."phrase" to "authenticated";

grant trigger on table "public"."phrase" to "authenticated";

grant truncate on table "public"."phrase" to "authenticated";

grant update on table "public"."phrase" to "authenticated";

grant delete on table "public"."phrase" to "service_role";

grant insert on table "public"."phrase" to "service_role";

grant references on table "public"."phrase" to "service_role";

grant select on table "public"."phrase" to "service_role";

grant trigger on table "public"."phrase" to "service_role";

grant truncate on table "public"."phrase" to "service_role";

grant update on table "public"."phrase" to "service_role";

grant delete on table "public"."recording" to "anon";

grant insert on table "public"."recording" to "anon";

grant references on table "public"."recording" to "anon";

grant select on table "public"."recording" to "anon";

grant trigger on table "public"."recording" to "anon";

grant truncate on table "public"."recording" to "anon";

grant update on table "public"."recording" to "anon";

grant delete on table "public"."recording" to "authenticated";

grant insert on table "public"."recording" to "authenticated";

grant references on table "public"."recording" to "authenticated";

grant select on table "public"."recording" to "authenticated";

grant trigger on table "public"."recording" to "authenticated";

grant truncate on table "public"."recording" to "authenticated";

grant update on table "public"."recording" to "authenticated";

grant delete on table "public"."recording" to "service_role";

grant insert on table "public"."recording" to "service_role";

grant references on table "public"."recording" to "service_role";

grant select on table "public"."recording" to "service_role";

grant trigger on table "public"."recording" to "service_role";

grant truncate on table "public"."recording" to "service_role";

grant update on table "public"."recording" to "service_role";

grant delete on table "public"."subject" to "anon";

grant insert on table "public"."subject" to "anon";

grant references on table "public"."subject" to "anon";

grant select on table "public"."subject" to "anon";

grant trigger on table "public"."subject" to "anon";

grant truncate on table "public"."subject" to "anon";

grant update on table "public"."subject" to "anon";

grant delete on table "public"."subject" to "authenticated";

grant insert on table "public"."subject" to "authenticated";

grant references on table "public"."subject" to "authenticated";

grant select on table "public"."subject" to "authenticated";

grant trigger on table "public"."subject" to "authenticated";

grant truncate on table "public"."subject" to "authenticated";

grant update on table "public"."subject" to "authenticated";

grant delete on table "public"."subject" to "service_role";

grant insert on table "public"."subject" to "service_role";

grant references on table "public"."subject" to "service_role";

grant select on table "public"."subject" to "service_role";

grant trigger on table "public"."subject" to "service_role";

grant truncate on table "public"."subject" to "service_role";

grant update on table "public"."subject" to "service_role";

grant delete on table "public"."translation" to "anon";

grant insert on table "public"."translation" to "anon";

grant references on table "public"."translation" to "anon";

grant select on table "public"."translation" to "anon";

grant trigger on table "public"."translation" to "anon";

grant truncate on table "public"."translation" to "anon";

grant update on table "public"."translation" to "anon";

grant delete on table "public"."translation" to "authenticated";

grant insert on table "public"."translation" to "authenticated";

grant references on table "public"."translation" to "authenticated";

grant select on table "public"."translation" to "authenticated";

grant trigger on table "public"."translation" to "authenticated";

grant truncate on table "public"."translation" to "authenticated";

grant update on table "public"."translation" to "authenticated";

grant delete on table "public"."translation" to "service_role";

grant insert on table "public"."translation" to "service_role";

grant references on table "public"."translation" to "service_role";

grant select on table "public"."translation" to "service_role";

grant trigger on table "public"."translation" to "service_role";

grant truncate on table "public"."translation" to "service_role";

grant update on table "public"."translation" to "service_role";

create policy "Enable ALL for users based on user_id"
on "public"."lesson"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable delete for users based on user_id"
on "public"."phrase"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable ALL for users based on user_id"
on "public"."recording"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable ALL for users based on user_id"
on "public"."subject"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable ALL for users based on user_id"
on "public"."translation"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));




create table "public"."phrase_tag" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "tag_id" bigint,
    "phrase_id" bigint
);


alter table "public"."phrase_tag" enable row level security;

create table "public"."tag" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "label" text,
    "user_id" uuid
);


alter table "public"."tag" enable row level security;

alter table "public"."translation" drop column "interval_history";

alter table "public"."translation" drop column "repetition_history";

CREATE UNIQUE INDEX phrase_tag_pkey ON public.phrase_tag USING btree (id);

CREATE UNIQUE INDEX tag_pkey ON public.tag USING btree (id);

CREATE UNIQUE INDEX unique_user_label ON public.tag USING btree (user_id, label);

alter table "public"."phrase_tag" add constraint "phrase_tag_pkey" PRIMARY KEY using index "phrase_tag_pkey";

alter table "public"."tag" add constraint "tag_pkey" PRIMARY KEY using index "tag_pkey";

alter table "public"."phrase_tag" add constraint "phrase_tag_phrase_id_fkey" FOREIGN KEY (phrase_id) REFERENCES phrase(id) ON DELETE CASCADE not valid;

alter table "public"."phrase_tag" validate constraint "phrase_tag_phrase_id_fkey";

alter table "public"."phrase_tag" add constraint "phrase_tag_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE not valid;

alter table "public"."phrase_tag" validate constraint "phrase_tag_tag_id_fkey";

alter table "public"."tag" add constraint "tag_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."tag" validate constraint "tag_user_id_fkey";

alter table "public"."tag" add constraint "unique_user_label" UNIQUE using index "unique_user_label";

grant delete on table "public"."phrase_tag" to "anon";

grant insert on table "public"."phrase_tag" to "anon";

grant references on table "public"."phrase_tag" to "anon";

grant select on table "public"."phrase_tag" to "anon";

grant trigger on table "public"."phrase_tag" to "anon";

grant truncate on table "public"."phrase_tag" to "anon";

grant update on table "public"."phrase_tag" to "anon";

grant delete on table "public"."phrase_tag" to "authenticated";

grant insert on table "public"."phrase_tag" to "authenticated";

grant references on table "public"."phrase_tag" to "authenticated";

grant select on table "public"."phrase_tag" to "authenticated";

grant trigger on table "public"."phrase_tag" to "authenticated";

grant truncate on table "public"."phrase_tag" to "authenticated";

grant update on table "public"."phrase_tag" to "authenticated";

grant delete on table "public"."phrase_tag" to "service_role";

grant insert on table "public"."phrase_tag" to "service_role";

grant references on table "public"."phrase_tag" to "service_role";

grant select on table "public"."phrase_tag" to "service_role";

grant trigger on table "public"."phrase_tag" to "service_role";

grant truncate on table "public"."phrase_tag" to "service_role";

grant update on table "public"."phrase_tag" to "service_role";

grant delete on table "public"."tag" to "anon";

grant insert on table "public"."tag" to "anon";

grant references on table "public"."tag" to "anon";

grant select on table "public"."tag" to "anon";

grant trigger on table "public"."tag" to "anon";

grant truncate on table "public"."tag" to "anon";

grant update on table "public"."tag" to "anon";

grant delete on table "public"."tag" to "authenticated";

grant insert on table "public"."tag" to "authenticated";

grant references on table "public"."tag" to "authenticated";

grant select on table "public"."tag" to "authenticated";

grant trigger on table "public"."tag" to "authenticated";

grant truncate on table "public"."tag" to "authenticated";

grant update on table "public"."tag" to "authenticated";

grant delete on table "public"."tag" to "service_role";

grant insert on table "public"."tag" to "service_role";

grant references on table "public"."tag" to "service_role";

grant select on table "public"."tag" to "service_role";

grant trigger on table "public"."tag" to "service_role";

grant truncate on table "public"."tag" to "service_role";

grant update on table "public"."tag" to "service_role";


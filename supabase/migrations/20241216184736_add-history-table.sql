create table "public"."history" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "topic" text,
    "lang" iso_639_language_code not null,
    "insight" text not null
);


alter table "public"."history" enable row level security;

CREATE UNIQUE INDEX history_pkey ON public.history USING btree (id);

alter table "public"."history" add constraint "history_pkey" PRIMARY KEY using index "history_pkey";

alter table "public"."history" add constraint "history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."history" validate constraint "history_user_id_fkey";

grant delete on table "public"."history" to "anon";

grant insert on table "public"."history" to "anon";

grant references on table "public"."history" to "anon";

grant select on table "public"."history" to "anon";

grant trigger on table "public"."history" to "anon";

grant truncate on table "public"."history" to "anon";

grant update on table "public"."history" to "anon";

grant delete on table "public"."history" to "authenticated";

grant insert on table "public"."history" to "authenticated";

grant references on table "public"."history" to "authenticated";

grant select on table "public"."history" to "authenticated";

grant trigger on table "public"."history" to "authenticated";

grant truncate on table "public"."history" to "authenticated";

grant update on table "public"."history" to "authenticated";

grant delete on table "public"."history" to "service_role";

grant insert on table "public"."history" to "service_role";

grant references on table "public"."history" to "service_role";

grant select on table "public"."history" to "service_role";

grant trigger on table "public"."history" to "service_role";

grant truncate on table "public"."history" to "service_role";

grant update on table "public"."history" to "service_role";



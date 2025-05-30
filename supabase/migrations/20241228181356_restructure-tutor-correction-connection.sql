create table "public"."correction" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_text" text not null,
    "response" jsonb not null,
    "user_id" uuid,
    "topic_id" bigint not null
);


alter table "public"."correction" enable row level security;

alter table "public"."tutor_topic" drop column "response";

CREATE UNIQUE INDEX correction_pkey ON public.correction USING btree (id);

alter table "public"."correction" add constraint "correction_pkey" PRIMARY KEY using index "correction_pkey";

alter table "public"."correction" add constraint "correction_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES tutor_topic(id) ON DELETE CASCADE not valid;

alter table "public"."correction" validate constraint "correction_topic_id_fkey";

alter table "public"."correction" add constraint "correction_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."correction" validate constraint "correction_user_id_fkey";

grant delete on table "public"."correction" to "anon";

grant insert on table "public"."correction" to "anon";

grant references on table "public"."correction" to "anon";

grant select on table "public"."correction" to "anon";

grant trigger on table "public"."correction" to "anon";

grant truncate on table "public"."correction" to "anon";

grant update on table "public"."correction" to "anon";

grant delete on table "public"."correction" to "authenticated";

grant insert on table "public"."correction" to "authenticated";

grant references on table "public"."correction" to "authenticated";

grant select on table "public"."correction" to "authenticated";

grant trigger on table "public"."correction" to "authenticated";

grant truncate on table "public"."correction" to "authenticated";

grant update on table "public"."correction" to "authenticated";

grant delete on table "public"."correction" to "service_role";

grant insert on table "public"."correction" to "service_role";

grant references on table "public"."correction" to "service_role";

grant select on table "public"."correction" to "service_role";

grant trigger on table "public"."correction" to "service_role";

grant truncate on table "public"."correction" to "service_role";

grant update on table "public"."correction" to "service_role";



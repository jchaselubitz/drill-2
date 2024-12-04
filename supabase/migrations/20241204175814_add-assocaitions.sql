create table "public"."association" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "phrase_primary_id" bigint not null,
    "phrase_secondary_id" bigint not null
);


alter table "public"."association" enable row level security;

CREATE UNIQUE INDEX associations_pkey ON public.association USING btree (id);

alter table "public"."association" add constraint "associations_pkey" PRIMARY KEY using index "associations_pkey";

alter table "public"."association" add constraint "association_phrase_primary_id_fkey" FOREIGN KEY (phrase_primary_id) REFERENCES phrase(id) ON DELETE CASCADE not valid;

alter table "public"."association" validate constraint "association_phrase_primary_id_fkey";

alter table "public"."association" add constraint "association_phrase_secondary_id_fkey" FOREIGN KEY (phrase_secondary_id) REFERENCES phrase(id) ON DELETE CASCADE not valid;

alter table "public"."association" validate constraint "association_phrase_secondary_id_fkey";

grant delete on table "public"."association" to "anon";

grant insert on table "public"."association" to "anon";

grant references on table "public"."association" to "anon";

grant select on table "public"."association" to "anon";

grant trigger on table "public"."association" to "anon";

grant truncate on table "public"."association" to "anon";

grant update on table "public"."association" to "anon";

grant delete on table "public"."association" to "authenticated";

grant insert on table "public"."association" to "authenticated";

grant references on table "public"."association" to "authenticated";

grant select on table "public"."association" to "authenticated";

grant trigger on table "public"."association" to "authenticated";

grant truncate on table "public"."association" to "authenticated";

grant update on table "public"."association" to "authenticated";

grant delete on table "public"."association" to "service_role";

grant insert on table "public"."association" to "service_role";

grant references on table "public"."association" to "service_role";

grant select on table "public"."association" to "service_role";

grant trigger on table "public"."association" to "service_role";

grant truncate on table "public"."association" to "service_role";

grant update on table "public"."association" to "service_role";



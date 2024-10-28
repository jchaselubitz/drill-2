alter table "public"."cards" drop column "interval_min";
alter table "public"."cards" drop column "next_repetition";
alter table "public"."cards" drop column "num_repetitions";
alter table "public"."cards" add column "interval_history" integer[];
alter table "public"."cards" add column "repetition_history" timestamp with time zone[];
alter table "public"."lessons" drop column "review_deck";
alter table "public"."lessons" add column "review_deck" jsonb[];

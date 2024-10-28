alter table "public"."cards" add column "num_repetitions" integer;
alter table "public"."lessons" add column "review_date" timestamp with time zone;
alter table "public"."lessons" add column "review_deck" bigint[];

alter table "public"."history" drop column "insight";

alter table "public"."history" drop column "topic";

alter table "public"."history" add column "concepts" text[];

alter table "public"."history" add column "insights" text not null;

alter table "public"."history" add column "vocabulary" jsonb[] default '{}'::jsonb[];

alter table "public"."tutor_topic" add column "response" jsonb;



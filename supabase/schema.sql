

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."iso_639_language_code" AS ENUM (
    'aa',
    'ab',
    'ae',
    'af',
    'ak',
    'am',
    'an',
    'ar',
    'as',
    'av',
    'ay',
    'az',
    'ba',
    'be',
    'bg',
    'bh',
    'bi',
    'bm',
    'bn',
    'bo',
    'br',
    'bs',
    'ca',
    'ce',
    'ch',
    'co',
    'cr',
    'cs',
    'cu',
    'cv',
    'cy',
    'da',
    'de',
    'dv',
    'dz',
    'ee',
    'el',
    'en',
    'eo',
    'es',
    'et',
    'eu',
    'fa',
    'ff',
    'fi',
    'fj',
    'fo',
    'fr',
    'fy',
    'ga',
    'gd',
    'gl',
    'gn',
    'gu',
    'gv',
    'ha',
    'he',
    'hi',
    'ho',
    'hr',
    'ht',
    'hu',
    'hy',
    'hz',
    'ia',
    'id',
    'ie',
    'ig',
    'ii',
    'ik',
    'io',
    'is',
    'it',
    'iu',
    'ja',
    'jv',
    'ka',
    'kg',
    'ki',
    'kj',
    'kk',
    'kl',
    'km',
    'kn',
    'ko',
    'kr',
    'ks',
    'ku',
    'kv',
    'kw',
    'ky',
    'la',
    'lb',
    'lg',
    'li',
    'ln',
    'lo',
    'lt',
    'lu',
    'lv',
    'mg',
    'mh',
    'mi',
    'mk',
    'ml',
    'mn',
    'mr',
    'ms',
    'mt',
    'my',
    'na',
    'nb',
    'nd',
    'ne',
    'ng',
    'nl',
    'nn',
    'no',
    'nr',
    'nv',
    'ny',
    'oc',
    'oj',
    'om',
    'or',
    'os',
    'pa',
    'pi',
    'pl',
    'ps',
    'pt',
    'qu',
    'rm',
    'rn',
    'ro',
    'ru',
    'rw',
    'sa',
    'sc',
    'sd',
    'se',
    'sg',
    'si',
    'sk',
    'sl',
    'sm',
    'sn',
    'so',
    'sq',
    'sr',
    'ss',
    'st',
    'su',
    'sv',
    'sw',
    'ta',
    'te',
    'tg',
    'th',
    'ti',
    'tk',
    'tl',
    'tn',
    'to',
    'tr',
    'ts',
    'tt',
    'tw',
    'ty',
    'ug',
    'uk',
    'ur',
    'uz',
    've',
    'vi',
    'vo',
    'wa',
    'wo',
    'xh',
    'yi',
    'yo',
    'za',
    'zh',
    'zu'
);


ALTER TYPE "public"."iso_639_language_code" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_translation"("_user_id" "uuid", "_translation" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    _phrase_primary_id int8;
    _phrase_secondary_id int8;
    _translation_id int8; -- Variable to hold the id of the inserted translation
BEGIN
    -- Insert phrase_primary, checking for optional part_speech
    INSERT INTO phrases (text, lang, source, part_speech)
    VALUES (
        _translation->'phrase_primary'->>'text',
        _translation->'phrase_primary'->>'lang',
        _translation->'phrase_primary'->>'source',
        COALESCE(_translation->'phrase_primary'->>'part_speech', NULL) -- NULL if part_speech is not provided
    )
    RETURNING id INTO _phrase_primary_id;

    -- Insert phrase_secondary, checking for optional part_speech
    INSERT INTO phrases (text, lang, source, part_speech)
    VALUES (
        _translation->'phrase_secondary'->>'text',
        _translation->'phrase_secondary'->>'lang',
        _translation->'phrase_secondary'->>'source',
        COALESCE(_translation->'phrase_secondary'->>'part_speech', NULL) -- NULL if part_speech is not provided
    )
    RETURNING id INTO _phrase_secondary_id;

    -- Insert translation with references to phrases and capture the translation id
    INSERT INTO translations (user_id, phrase_primary_id, phrase_secondary_id)
    VALUES (_user_id, _phrase_primary_id, _phrase_secondary_id)
    RETURNING id INTO _translation_id;

    RETURN _translation_id; -- Return the id of the newly inserted translation
END;
$$;


ALTER FUNCTION "public"."add_translation"("_user_id" "uuid", "_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_translation_to_phrase"("_user_id" "uuid", "_phrase_primary_ids" bigint[], "_translation" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$DECLARE
    _phrase_secondary_id int8;
    _current_primary_id int8;
BEGIN
    -- Insert phrase_secondary, checking for optional part_speech
    INSERT INTO phrases (text, lang, source, part_speech)
    VALUES (
        _translation->'phrase_secondary'->>'text',
        _translation->'phrase_secondary'->>'lang',
        _translation->'phrase_secondary'->>'source',
        COALESCE(_translation->'phrase_secondary'->>'part_speech', NULL)
    )
    RETURNING id INTO _phrase_secondary_id;

    -- Loop through each phrase_primary_id and create a translation
    FOREACH _current_primary_id IN ARRAY _phrase_primary_ids LOOP
        INSERT INTO translations (user_id, phrase_primary_id, phrase_secondary_id)
        VALUES (_user_id, _current_primary_id, _phrase_secondary_id);
    END LOOP;
    
    RETURN _phrase_secondary_id;
END;$$;


ALTER FUNCTION "public"."add_translation_to_phrase"("_user_id" "uuid", "_phrase_primary_ids" bigint[], "_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_translations_to_lesson"("_user_id" "uuid", "_lesson_id" bigint, "_translations" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    _phrase_primary_id int;
    _phrase_secondary_id int;
    _translation_record jsonb;
BEGIN
    -- Process each translation
    FOR _translation_record IN SELECT * FROM jsonb_array_elements(_translations) LOOP
        -- Insert phrase_primary
        INSERT INTO phrases (text, lang)
        VALUES (_translation_record->'phrase_primary'->>'text', _translation_record->'phrase_primary'->>'lang')
        RETURNING id INTO _phrase_primary_id;

        -- Insert phrase_secondary
        INSERT INTO phrases (text, lang)
        VALUES (_translation_record->'phrase_secondary'->>'text', _translation_record->'phrase_secondary'->>'lang')
        RETURNING id INTO _phrase_secondary_id;

        -- Insert translation with references to phrases
        INSERT INTO translations (lesson_id, user_id, phrase_primary_id, phrase_secondary_id)
        VALUES (_lesson_id, _user_id, _phrase_primary_id, _phrase_secondary_id);
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."add_translations_to_lesson"("_user_id" "uuid", "_lesson_id" bigint, "_translations" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.profiles (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_subject_lesson_translations"("_user_id" "uuid", "_subject_name" "text", "_current_level" "text", "_lesson_title" "text", "_lesson_description" "text", "_translations" "jsonb", "_subject_id" bigint) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    _new_subject_id int8;
    _lesson_id int8;
    _phrase_primary_id int;
    _phrase_secondary_id int;
    _translation_record jsonb;
BEGIN
    -- Check if subject_id is provided
    IF _subject_id IS NOT NULL THEN
        -- Update existing subject (if any other updates are needed)
        UPDATE subjects SET name = _subject_name, current_level = _current_level
        WHERE id = _subject_id;
        _new_subject_id := _subject_id;
    ELSE
        -- Insert new subject
        INSERT INTO subjects (user_id, name, current_level)
        VALUES (_user_id, _subject_name, _current_level)
        RETURNING id INTO _new_subject_id;
    END IF;

    -- Insert lesson
    INSERT INTO lessons (user_id, title, short_description, subject_id)
    VALUES (_user_id, _lesson_title, _lesson_description, _new_subject_id)
    RETURNING id INTO _lesson_id;

    -- Process each translation
    FOR _translation_record IN SELECT * FROM jsonb_array_elements(_translations) LOOP
        -- Insert phrase_primary
        INSERT INTO phrases (text, lang)
        VALUES (_translation_record->'phrase_primary'->>'text', _translation_record->'phrase_primary'->>'lang')
        RETURNING id INTO _phrase_primary_id;

        -- Insert phrase_secondary
        INSERT INTO phrases (text, lang)
        VALUES (_translation_record->'phrase_secondary'->>'text', _translation_record->'phrase_secondary'->>'lang')
        RETURNING id INTO _phrase_secondary_id;

        -- Insert translation with references to phrases
        INSERT INTO translations (lesson_id, user_id, phrase_primary_id, phrase_secondary_id)
        VALUES (_lesson_id, _user_id, _phrase_primary_id, _phrase_secondary_id);
    END LOOP;

    -- Return lesson_id and subject_id
    RETURN json_build_object('lesson_id', _lesson_id, 'subject_id', _new_subject_id);

EXCEPTION WHEN OTHERS THEN
    -- Handle exceptions
    RAISE;
END;
$$;


ALTER FUNCTION "public"."create_subject_lesson_translations"("_user_id" "uuid", "_subject_name" "text", "_current_level" "text", "_lesson_title" "text", "_lesson_description" "text", "_translations" "jsonb", "_subject_id" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "subject_id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "short_description" "text",
    "recording_url" "text",
    "content" "text",
    "show_side_2_first" boolean,
    "review_date" timestamp with time zone,
    "review_deck" "jsonb"[]
);


ALTER TABLE "public"."lessons" OWNER TO "postgres";


ALTER TABLE "public"."lessons" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."lessons_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."phrases" (
    "id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "text" "text",
    "lang" "text",
    "source" "text",
    "part_speech" "text"
);


ALTER TABLE "public"."phrases" OWNER TO "postgres";


ALTER TABLE "public"."phrases" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."phrases_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "language" "public"."iso_639_language_code" DEFAULT 'en'::"public"."iso_639_language_code" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "primary_language" "public"."iso_639_language_code"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE "public"."profiles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."recordings" (
    "id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "filename" "text",
    "transcript" "text",
    "lang" "public"."iso_639_language_code"
);


ALTER TABLE "public"."recordings" OWNER TO "postgres";


ALTER TABLE "public"."recordings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."recordings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "current_level" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


ALTER TABLE "public"."subjects" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."subjects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."translations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "lesson_id" bigint,
    "user_id" "uuid" NOT NULL,
    "interval_history" integer[],
    "repetition_history" timestamp with time zone[],
    "phrase_primary_id" bigint NOT NULL,
    "phrase_secondary_id" bigint NOT NULL
);


ALTER TABLE "public"."translations" OWNER TO "postgres";


ALTER TABLE "public"."translations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."translations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phrases"
    ADD CONSTRAINT "phrases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id", "user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."recordings"
    ADD CONSTRAINT "recordings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id");



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_phrase_primary_id_fkey" FOREIGN KEY ("phrase_primary_id") REFERENCES "public"."phrases"("id");



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_phrase_secondary_id_fkey" FOREIGN KEY ("phrase_secondary_id") REFERENCES "public"."phrases"("id");



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable ALL for users based on user_id" ON "public"."lessons" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable ALL for users based on user_id" ON "public"."recordings" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable ALL for users based on user_id" ON "public"."subjects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable ALL for users based on user_id" ON "public"."translations" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable all for users based on user_id" ON "public"."phrases" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable all for users based on user_id" ON "public"."profiles" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phrases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recordings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
































































































































































































GRANT ALL ON FUNCTION "public"."add_translation"("_user_id" "uuid", "_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_translation"("_user_id" "uuid", "_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_translation"("_user_id" "uuid", "_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_translation_to_phrase"("_user_id" "uuid", "_phrase_primary_ids" bigint[], "_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_translation_to_phrase"("_user_id" "uuid", "_phrase_primary_ids" bigint[], "_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_translation_to_phrase"("_user_id" "uuid", "_phrase_primary_ids" bigint[], "_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_translations_to_lesson"("_user_id" "uuid", "_lesson_id" bigint, "_translations" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_translations_to_lesson"("_user_id" "uuid", "_lesson_id" bigint, "_translations" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_translations_to_lesson"("_user_id" "uuid", "_lesson_id" bigint, "_translations" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_subject_lesson_translations"("_user_id" "uuid", "_subject_name" "text", "_current_level" "text", "_lesson_title" "text", "_lesson_description" "text", "_translations" "jsonb", "_subject_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_subject_lesson_translations"("_user_id" "uuid", "_subject_name" "text", "_current_level" "text", "_lesson_title" "text", "_lesson_description" "text", "_translations" "jsonb", "_subject_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_subject_lesson_translations"("_user_id" "uuid", "_subject_name" "text", "_current_level" "text", "_lesson_title" "text", "_lesson_description" "text", "_translations" "jsonb", "_subject_id" bigint) TO "service_role";





















GRANT ALL ON TABLE "public"."lessons" TO "anon";
GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."phrases" TO "anon";
GRANT ALL ON TABLE "public"."phrases" TO "authenticated";
GRANT ALL ON TABLE "public"."phrases" TO "service_role";



GRANT ALL ON SEQUENCE "public"."phrases_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."phrases_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."phrases_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recordings" TO "anon";
GRANT ALL ON TABLE "public"."recordings" TO "authenticated";
GRANT ALL ON TABLE "public"."recordings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recordings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recordings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recordings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."translations" TO "anon";
GRANT ALL ON TABLE "public"."translations" TO "authenticated";
GRANT ALL ON TABLE "public"."translations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."translations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."translations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."translations_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

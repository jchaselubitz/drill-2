drop function if exists "public"."create_subject_lesson_cards"(_user_id uuid, _subject_name text, _current_level text, _lesson_title text, _lesson_description text, _cards jsonb, _subject_id bigint);
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.add_translations_to_lesson(_user_id uuid, _lesson_id bigint, _translations jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$;

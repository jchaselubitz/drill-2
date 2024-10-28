set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.add_translation_to_phrase(_user_id uuid, _phrase_primary_ids bigint[], _translation jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$DECLARE
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
END;$function$;

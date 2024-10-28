CREATE OR REPLACE FUNCTION public.add_translation(
    _user_id uuid,
    _translation jsonb
) RETURNS int8 -- Adjusted to return the id of the newly inserted translation
LANGUAGE plpgsql
AS $function$
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
$function$;

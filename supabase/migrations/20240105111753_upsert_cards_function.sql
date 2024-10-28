drop function if exists "public"."create_subject_lesson_cards"(_user_id uuid, _subject_name text, _current_level text, _lesson_title text, _cards jsonb);
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.create_subject_lesson_cards(
    _user_id uuid,
    _subject_name text,
    _current_level text,
    _lesson_title text,
    _lesson_description text,
    _cards jsonb,
    _subject_id int8
) RETURNS jsonb 
  LANGUAGE plpgsql
AS $function$
DECLARE
    _new_subject_id int8;
    _lesson_id int8;
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

    -- Insert cards
    INSERT INTO cards (lesson_id, user_id, side_1, side_2)
    SELECT _lesson_id, _user_id, card->>'side_1', card->>'side_2'
    FROM jsonb_array_elements(_cards::jsonb) AS card;

    -- Return lesson_id and subject_id
    RETURN json_build_object('lesson_id', _lesson_id, 'subject_id', _new_subject_id);

EXCEPTION WHEN OTHERS THEN
    -- Handle exceptions
    RAISE;
END;$function$;

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.create_subject_lesson_cards(_user_id uuid, _subject_name text, _current_level text, _lesson_title text, _cards jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE
    _subject_id int8;
    _lesson_id int8;
BEGIN
    -- Insert subject
    INSERT INTO subjects (user_id, name, current_level)
    VALUES (_user_id, _subject_name, _current_level)
    RETURNING id INTO _subject_id;

    -- Insert lesson
    INSERT INTO lessons (user_id, title, subject_id)
    VALUES (_user_id, _lesson_title, _subject_id)
    RETURNING id INTO _lesson_id;

    -- Insert cards
    INSERT INTO cards (lesson_id, user_id, side_1, side_2)
    SELECT _lesson_id, _user_id, card->>'side_1', card->>'side_2'
    FROM jsonb_array_elements(_cards::jsonb) AS card;

    RETURN true;

EXCEPTION WHEN OTHERS THEN
    -- If there is any error, rollback the transaction
    RAISE;
END;$function$;

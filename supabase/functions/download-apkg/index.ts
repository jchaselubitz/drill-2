import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import AnkiExport from 'npm:anki-apkg-export';
import { Lesson, Phrase, Translation } from '../_shared/types.ts';

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 15);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const bucket = 'text-to-speech';

  const data = await req.json();
  const lessonId = data.lessonId;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('DB_SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: lessons, error: errorLessons } = await supabase
    .from('lesson')
    .select(
      'id, title, side_one, side_two, translation( phrase_primary_id (text, lang), phrase_secondary_id (text, lang))'
    )
    .eq('id', lessonId);

  if (errorLessons) {
    return new Response(errorLessons.message, { status: 500 });
  }
  const lesson = lessons ? (lessons[0] as Lesson) : ({} as Lesson);

  async function downloadMedia(fileName: string) {
    const { data, error } = await supabase.storage.from(bucket).download(fileName);

    if (error) {
      return null;
    }
    const audioBlob = new Blob([data], { type: 'audio/mpeg' });
    const arrayBuffer = await audioBlob.arrayBuffer(); // Convert the data to ArrayBuffer
    return arrayBuffer;
  }

  const apkg = new AnkiExport.default(lesson.title);
  const createMediaPackage = async () => {
    await Promise.all(
      lesson.translation?.map(async (t: Translation) => {
        const phrases = [t.phrase_primary_id, t.phrase_secondary_id];
        const side1 = phrases.find((p) => p.lang === lesson.side_one) as Phrase;
        const side2 = phrases.find((p) => p.lang === lesson.side_two) as Phrase;
        if (!side1.text || !side2.text) return;
        const fileName = (await hashString(side2.text)) + '.mp3';
        const media = await downloadMedia(fileName);
        if (media !== null) {
          apkg.addMedia(`${fileName}`, media);
        }
        const withMedia = media !== null ? `[sound:${fileName}]` : '';
        apkg.addCard(side1.text, `${side2.text} ${withMedia}`);
      })
    );
    return await apkg.save();
  };

  const zip = await createMediaPackage();

  const resp = new Response(zip, {
    headers: {
      ...corsHeaders,
      'Content-Disposition': 'attachment; filename="export.apkg"',
      'Content-Type': 'application/octet-stream',
    },
  });
  return resp;
  // if (error) {
  //   return new Response(JSON.stringify({ error: error.message }), {
  //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  //     status: 400,
  //   });
  // }

  // return new Response('Method not allowed', {
  //   status: 405,
  //   headers: corsHeaders,
  // });
});

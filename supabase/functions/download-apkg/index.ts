import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import AnkiExport from 'npm:anki-apkg-export';

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

  const data = await req.json();
  const lessonId = data.lessonId;
  const bucket = 'text_to_speech';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('DB_SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: lessons, error: errorLessons } = await supabase
    .from('lesson')
    .select(
      'id, title, translation ( phrase_primary_id (text, lang), phrase_secondary_id (text, lang))'
    );

  if (errorLessons) {
    return new Response(errorLessons.message, { status: 500 });
  }
  const lesson = lessons ? (lessons[0] as any) : ({} as Lesson);

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
      lesson.translation?.map(async (t: any) => {
        const primary = t.phrase_primary_id as Phrase;
        const secondary = t.phrase_secondary_id as Phrase;
        if (!primary.text || !secondary.text) return;
        const fileName = (await hashString(secondary.text)) + '.mp3';
        const media = await downloadMedia(fileName);
        if (media !== null) {
          apkg.addMedia(`${fileName}`, media);
        }
        const withMedia = media !== null ? `[sound:${fileName}]` : '';
        apkg.addCard(primary.text, `${secondary.text} ${withMedia}`);
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
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  });
});

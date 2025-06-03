import { corsHeaders } from '../_shared/cors.ts';
import { createHash } from 'https://deno.land/std@0.114.0/hash/mod.ts';
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { Lesson, Phrase, Translation } from '../_shared/types.ts';

async function hashString(text: string): Promise<string> {
  const hash = await createHash('sha256');
  hash.update(text);
  return hash.toString();
}

async function getUrl(text: string, bucket: string, supabase: SupabaseClient) {
  const fileName = (await hashString(text)) + '.mp3';
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName, { download: true });

  if (data) {
    return data;
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const data = await req.json();
  const lessonId = data.lessonId;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: lessons, error: errorLessons } = await supabase
    .from('lesson')
    .select(
      'id, title, side_one, side_two, translation ( phrase_primary_id (text, lang), phrase_secondary_id (text, lang))'
    )
    .eq('id', lessonId);

  if (errorLessons) {
    return new Response(errorLessons.message, { status: 500 });
  }

  const lesson = lessons ? (lessons[0] as Lesson) : ({} as Lesson);

  const createExportArray = async () =>
    await Promise.all(
      lesson.translation?.map(async (t: Translation) => {
        const phrases = [t.phrase_primary_id, t.phrase_secondary_id];
        const side1 = phrases.find((p) => p.lang === lesson.side_one) as Phrase;
        const side2 = phrases.find((p) => p.lang === lesson.side_two) as Phrase;
        const fileUrl = await getUrl(side2.text as string, 'text-to-speech', supabase);

        return {
          [side1.lang as string]: side2.text,
          [side2.lang as string]: side2.text,
          ['media' as any]: fileUrl.publicUrl,
        };
      })
    );

  const arrayForExport = await createExportArray();

  const headers = Object.keys(arrayForExport[0]);

  const csvContent = arrayForExport.map((row: any) => {
    return headers.map((header) => `"${row[header].replace(/"/g, '""')}"`).join(',');
  });

  const csvOutput = [...csvContent].join('\n');

  return new Response(csvOutput, {
    headers: {
      ...corsHeaders,
      'Content-Disposition': 'attachment; filename=export.csv',
      'Content-Type': 'text/csv',
    },
  });
});

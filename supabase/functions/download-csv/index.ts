import { corsHeaders } from '../_shared/cors.ts';
import { createHash } from 'https://deno.land/std@0.114.0/hash/mod.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface Lesson {
  id: string;
  title: string;
  translations: Translation[];
}

interface Translation {
  phrase_primary_id: Phrase;
  phrase_secondary_id: Phrase;
}

interface Phrase {
  text: string;
  lang: string;
}

async function hashString(text: string): Promise<string> {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.toString();
}

async function getUrl(text: string, bucket: string, supabase: any) {
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
    )
    .eq('id', lessonId);
  if (errorLessons) {
    return new Response(errorLessons.message, { status: 500 });
  }

  const lesson = lessons ? (lessons[0] as any) : ({} as Lesson);

  const createExportArray = async () =>
    await Promise.all(
      lesson.translation?.map(async (t: any) => {
        const primary = t.phrase_primary_id as Phrase;
        const secondary = t.phrase_secondary_id as Phrase;
        const fileUrl = await getUrl(secondary.text as string, 'text_to_speech', supabase);

        return {
          [primary.lang as any]: primary.text,
          [secondary.lang as any]: secondary.text,
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

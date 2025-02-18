import { OpenAI } from 'https://deno.land/x/openai@v4.69.0/mod.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { Langfuse } from 'https://esm.sh/langfuse';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const langfuse = new Langfuse({
    secretKey: Deno.env.get('LANGFUSE_SECRET_KEY'),
    publicKey: Deno.env.get('LANGFUSE_PUBLIC_KEY'),
    baseUrl: Deno.env.get('LANGFUSE_HOST'),
  });

  const data = await req.json();
  const userApiKey = data.userApiKey;
  const text = data.text;
  const fileName = data.fileName;
  const bucketName = 'text_to_speech';
  // Try to get image from Supabase Storage CDN.

  const trace = langfuse.trace({
    name: 'text-to-speech',
    tags: [Deno.env.get('LANGFUSE_SECRET_KEY') || 'undefined env'],
  });
  const span = trace.span({
    name: 'transcription',
    input: {
      text,
      fileName,
      bucketName,
    },
  });

  const supabaseAdminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const openai = new OpenAI({ apiKey: userApiKey });

  span.update({
    metadata: {
      httpRoute: '/api/text-to-speech',
    },
  });
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });

  const arrayBuffer = await mp3.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { data: storageData, error } = await supabaseAdminClient.storage
    .from(bucketName)
    .upload(fileName, uint8Array, {
      contentType: 'audio/mpeg',
      upsert: false,
    });

  span.end({
    output: {
      response: 'audio file',
    },
  });

  langfuse.on('error', (error) => {
    console.error('text-to-speech' + error);
  });
  await langfuse.shutdownAsync();

  if (storageData) {
    return new Response(JSON.stringify(storageData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

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

import OpenAI from 'jsr:@openai/openai';
// import type { Uploadable } from 'openai/uploads.mjs';
import { corsHeaders } from '../_shared/cors.ts';
import { Uploadable } from 'https://deno.land/x/openai@v4.69.0/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const data = await req.formData();
      // const userApiKey = data.get('userApiKey');
      const audioFile = data.get('audioFile');

      const openai = new OpenAI({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile as Uploadable,
        model: 'whisper-1',
        response_format: 'json',
      });
      const resp = { data: transcription.text };

      return new Response(JSON.stringify(resp), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  });
});

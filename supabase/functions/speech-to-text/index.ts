import OpenAI from 'jsr:@openai/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { Uploadable } from 'https://deno.land/x/openai@v4.69.0/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const data = await req.formData();

      // const COMPRESS_URL = 'http://localhost:3000/api/compress_audio';
      // console.log('Attempting to fetch from:', COMPRESS_URL);

      // const testResponse = await fetch('http://localhost:3000/api/compressAudio', {
      //   method: 'POST',
      //   body: data,
      // });
      // console.log('Test response:', {
      //   ok: testResponse.ok,
      //   status: testResponse.status,
      //   headers: Object.fromEntries(testResponse.headers),
      // });

      // const compressResponse = await fetch(COMPRESS_URL, {
      //   method: 'POST',
      //   body: data,
      //   headers: {
      //     // Remove Content-Type header to let the browser set it correctly for FormData
      //     Origin: 'http://localhost:3000',
      //   },
      // });

      // if (!compressResponse.ok) {
      //   const errorText = await compressResponse.text();
      //   console.error('Compression failed:', {
      //     status: compressResponse.status,
      //     text: errorText,
      //   });
      //   throw new Error(`Compression failed: ${errorText}`);
      // }
      // console.log('compressResponse', compressResponse);
      // const compressedArrayBuffer = await compressResponse.arrayBuffer();
      // const compressedBlob = new Blob([compressedArrayBuffer], { type: 'audio/mpeg' });

      // const audioFile = new File([compressedBlob], 'podcast.mp3', { type: 'audio/mpeg' });

      const audioFile = data.get('audioFile');

      // if (!audioFile) {
      //   throw new Error('No audio file provided');
      // }
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

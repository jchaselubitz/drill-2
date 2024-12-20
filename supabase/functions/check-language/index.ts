import { OpenAI } from 'https://deno.land/x/openai@v4.69.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { OpenAiModel } from '../_shared/enums.ts';
import { ChatCompletionMessageParam } from 'https://deno.land/x/openai@v4.69.0/resources/mod.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const data = await req.json();
  const text = data.text;
  const snippet = text.slice(0, 20);
  const messages = [
    {
      role: 'system',
      content: 'ISO 639 code as JSON object such as: { "lng": "en" }',
    },
    { role: 'user', content: `what is the language of this text: ${snippet}?` },
  ] as ChatCompletionMessageParam[];

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const completion = await openai.chat.completions.create({
      model: OpenAiModel.gpt4oMini,
      messages: messages,
      response_format: { type: 'json_object' },
      presence_penalty: 0,
      frequency_penalty: 0,
      temperature: 1,
      max_tokens: 20,
      stream: false,
    });

    const reply = completion.choices[0].message.content;

    return new Response(JSON.stringify(reply), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

//Instructions: https://supabase.com/docs/guides/ai/examples/openai

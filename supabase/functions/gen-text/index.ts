import OpenAI from 'jsr:@openai/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { OpenAiModel } from '../_shared/enums.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const data = await req.json();
  const modelSelection = data.modelSelection;
  const modelParams = data.modelParams;
  const messages = data.messages;
  const userApiKey = data.userApiKey;

  try {
    const openai = new OpenAI({
      apiKey: userApiKey ? userApiKey : Deno.env.get('OPENAI_API_KEY'),
    });

    const {
      format,
      presence_penalty = 0,
      frequency_penalty = 0,
      temperature = 0.5,
      max_tokens = 3500,
      stream = false,
    } = modelParams;

    const completion = await openai.chat.completions.create({
      model: userApiKey ? modelSelection : OpenAiModel.gpt4oMini,
      messages: messages,
      response_format: format,
      presence_penalty,
      frequency_penalty,
      temperature,
      max_tokens,
      stream,
    });

    const reply = completion.choices[0].message;

    return new Response(JSON.stringify(reply), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

//Instructions: https://supabase.com/docs/guides/ai/examples/openai

import OpenAI from 'jsr:@openai/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { OpenAiModel, AnthropicModel } from '../_shared/enums.ts';
import { createSystemPrompt } from '../_shared/functions.ts';
import { Langfuse } from 'https://esm.sh/langfuse';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.18.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const data = await req.json();
  const prompt = data.prompt;
  const apiSelection = data.apiSelection;
  const dependencies = data.dependencies;
  const css = data.css;
  // const userApiKey = data.userApiKey;
  const useAnthropic = apiSelection === 'anthropic';
  const modelChoice = useAnthropic ? AnthropicModel.claude35Haiku : OpenAiModel.o3mini;

  const messages = [
    {
      role: 'system',
      content: createSystemPrompt(dependencies, css),
    },

    {
      role: 'user',
      content:
        prompt +
        ' (return a component that serves my request with an interactive component based on the available functions and types.)',
    },
  ];

  try {
    const langfuse = new Langfuse({
      secretKey: Deno.env.get('LANGFUSE_SECRET_KEY'),
      publicKey: Deno.env.get('LANGFUSE_PUBLIC_KEY'),
      baseUrl: Deno.env.get('LANGFUSE_HOST'),
    });

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    });

    const format = useAnthropic
      ? [
          {
            name: 'structured_output',
            description: 'Return a JSON object',
            input_schema: {
              type: 'object',
              properties: {
                componentType: { type: 'string' },
                props: { type: 'string' },
                react_node: { type: 'string' },
              },
              required: ['componentType', 'props', 'react_node'],
            },
          },
        ]
      : ({ type: 'json_object' } as any);
    const presence_penalty = 0;
    const frequency_penalty = 0;
    const temperature = 0.1;
    const max_tokens = 3500;
    const stream = false;

    const trace = langfuse.trace({
      name: 'gen-component',
      tags: [Deno.env.get('ENVIRONMENT') || 'undefined env'],
    });

    const generation = trace.generation({
      name: 'gen-component',
      model: modelChoice,
      input: messages,
      metadata: { format, dependencies },
      modelParameters: {
        presence_penalty,
        frequency_penalty,
        temperature,
        max_tokens,
        stream,
      },
    });

    const completion = async () => {
      if (useAnthropic) {
        return await anthropic.messages.create({
          model: modelChoice,
          messages: messages.slice(1),
          system: messages[0].content,
          temperature,
          max_tokens,
          tools: format,
        });
      } else {
        return await openai.chat.completions.create({
          model: modelChoice,
          messages: messages,
          response_format: format,
          reasoning_effort: 'low',
          // presence_penalty,
          // frequency_penalty,
          // temperature,
          // max_tokens,
          // stream,
        });
      }
    };

    const resp = useAnthropic ? await completion() : await completion();

    console.log(resp);
    const reply = useAnthropic
      ? resp.content.find((item: any) => item.type === 'tool_use').input
      : resp.choices[0].message.content;

    generation.end({
      output: resp,
    });

    langfuse.on('error', (error) => {
      console.error('gen-component' + error);
    });
    await langfuse.shutdownAsync();

    return new Response(JSON.stringify(reply), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

//Instructions: https://supabase.com/docs/guides/ai/examples/openai

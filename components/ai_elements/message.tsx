import React from 'react';
import Markdown from 'react-markdown';
import { ChatMessage } from '@/lib/aiGenerators/types_generation';
import { LanguagesISO639 } from '@/lib/lists';
import { cn } from '@/lib/utils';

import DynamicResponsePanel from './dynamic_response_panel';

const checkJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

type EnrichedContent = {
  type: string;
  data: any;
};

interface MessageProps {
  message: ChatMessage;
  lang: LanguagesISO639;
}

const Message: React.FC<MessageProps> = ({ message, lang }) => {
  const role = message.role;

  const normalizedContent = { type: 'message', data: message.content };

  const content = (
    checkJson(message.content) ? JSON.parse(message.content) : normalizedContent
  ) as EnrichedContent;

  return (
    <div
      className={cn('flex my-4 w-full', {
        'justify-start': role === 'assistant',
        'justify-end': role !== 'assistant',
      })}
    >
      <div
        className={cn('max-w-full p-3 rounded-lg text-gray-800', {
          'bg-blue-200 mr-8': role === 'assistant',
          'bg-slate-200 ml-8': role !== 'assistant',
        })}
      >
        {role === 'user' || content.type === 'message' ? (
          <Markdown className="max-w-full prose">{content.data}</Markdown>
        ) : (
          <div className="w-full">
            <DynamicResponsePanel
              genResponse={content}
              lang={lang}
              primaryPhraseIds={[]}
              source={'chat'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

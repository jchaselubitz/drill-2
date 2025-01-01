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

interface MessageProps {
  message: ChatMessage;
  lang: LanguagesISO639;
}

const Message: React.FC<MessageProps> = ({ message, lang }) => {
  const { role } = message;

  const content =
    role === 'assistant'
      ? checkJson(message.content)
        ? JSON.parse(message.content)
        : message.content
      : message.content;

  const assistantMessage = role === 'assistant' && content.data ? content.data : content;

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
        {role === 'user' ? (
          <Markdown className="max-w-full prose">{content as string}</Markdown>
        ) : content.type === 'translate' || content.type === 'list' ? (
          <div className="w-full">
            <DynamicResponsePanel
              genResponse={content}
              lang={lang}
              primaryPhraseIds={[]}
              source={'chat'}
            />
          </div>
        ) : (
          <Markdown className="max-w-full prose">{assistantMessage}</Markdown>
        )}
      </div>
    </div>
  );
};

export default Message;

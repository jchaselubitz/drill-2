import { BaseCorrection } from 'kysely-codegen';
import React from 'react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { useChatContext } from '@/contexts/chat_window_context';
import { removeMarkdownNotation } from '@/lib/helpers/helpersPhrase';
import { LanguagesISO639 } from '@/lib/lists';

import { AIButton } from '../specialButtons/ai_button';
import { Button } from '../ui/button';
import NestedObject from './nested_object';

interface GrammarCorrectionItemProps {
  correction: BaseCorrection;
  learningLang: LanguagesISO639;
}

const GrammarCorrectionItem: React.FC<GrammarCorrectionItemProps> = ({
  correction,
  learningLang,
}) => {
  const { setChatContext, setChatOpen, setCurrentLang } = useChatContext();
  const [capturedSentences, setCapturedSentences] = React.useState<string[]>([]);
  const correctionText = correction.response.correction;
  const feedback = correction.response.feedback.toString();

  const chatSystemMessage = `You are a tutor whose job is to help the user learn ${learningLang}`;

  const openInChat = () => {
    setCurrentLang(learningLang);
    setChatContext({
      systemMessage: chatSystemMessage,
      matterText: correction.userText,
      assistantAnswer: `**Correction:** ${correctionText}  **Feedback:** ${feedback}`,
    });
    setChatOpen(true);
  };

  const captureSentences = () => {
    if (capturedSentences.length > 0) {
      setCapturedSentences([]);
    } else {
      const sentences = correctionText
        .split(/[.?!]/)
        .map((s) => removeMarkdownNotation(s))
        .filter(Boolean)
        .map((s) => s + '.');
      setCapturedSentences(sentences);
    }
  };

  const sectionClass = 'space-x-2';
  const headerClass = 'text-xs uppercase font-semibold mb-2';
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionClass}>
        <h3 className={headerClass}>Your response</h3>
        <div>{correction.userText}</div>
      </div>
      <div>
        <div className={sectionClass}>
          <div className={headerClass}>Correction:</div>
          <div className="prose ">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{correctionText}</Markdown>
          </div>
        </div>
      </div>
      <div>
        <div className={sectionClass}>
          <div className={headerClass}>Feedback:</div>
          <div className="prose ">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{feedback}</Markdown>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <AIButton onClick={openInChat}>Discuss in chat</AIButton>
        <Button variant={'default'} onClick={captureSentences}>
          Capture sentences
        </Button>
      </div>
      {capturedSentences.length > 0 &&
        capturedSentences.map((sentence, index) => (
          <NestedObject
            key={index}
            data={{ content: sentence }}
            lang={learningLang}
            source={`correction - ${correction.id}`}
          />
        ))}
    </div>
  );
};

export default GrammarCorrectionItem;

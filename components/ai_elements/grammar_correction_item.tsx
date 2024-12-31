import { BaseCorrection } from 'kysely-codegen';
import React from 'react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { useChatContext } from '@/contexts/chat_window_context';
import { LanguagesISO639 } from '@/lib/lists';

import { Button } from '../ui/button';

interface GrammarCorrectionItemProps {
  correction: BaseCorrection;
  learningLang: LanguagesISO639;
}

const GrammarCorrectionItem: React.FC<GrammarCorrectionItemProps> = ({
  correction,
  learningLang,
}) => {
  const { setChatContext, setChatOpen, setCurrentLang } = useChatContext();
  const correctionText = correction.response.correction;
  const feedback = correction.response.feedback.toString();

  const chatSystemMessage =
    'You are a tutor whose job is to help the user learn the relevant language';

  const openInChat = () => {
    setCurrentLang(learningLang);
    setChatContext({
      systemMessage: chatSystemMessage,
      matterText: correction.userText,
      assistantAnswer: `**Correction:** ${correctionText}  **Feedback:** ${feedback}`,
    });
    setChatOpen(true);
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
      <Button
        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-fit "
        onClick={openInChat}
      >
        Discuss in chat
      </Button>
    </div>
  );
};

export default GrammarCorrectionItem;

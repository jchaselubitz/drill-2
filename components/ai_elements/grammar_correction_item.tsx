import { BaseCorrection } from 'kysely-codegen';
import React from 'react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface GrammarCorrectionItemProps {
  correction: BaseCorrection;
}

const GrammarCorrectionItem: React.FC<GrammarCorrectionItemProps> = ({ correction }) => {
  const correctionText = correction.response.correction;
  const feedback = correction.response.feedback.toString();

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
    </div>
  );
};

export default GrammarCorrectionItem;

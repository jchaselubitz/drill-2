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
  const feedback = correction.response.feedback;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs uppercase font-semibold">User Text</h3>
      <p>{correction.userText}</p>
      <div>
        <div className="space-x-2">
          <div className="text-xs uppercase font-semibold">Correction:</div>
          <div className="prose ">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{correctionText}</Markdown>
          </div>
        </div>
      </div>
      <div>
        <div className="space-x-2">
          <div className="text-xs uppercase font-semibold">Feedback:</div>
          <div className="prose ">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{feedback}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarCorrectionItem;

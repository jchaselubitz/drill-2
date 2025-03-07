'use client';

import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';
import { CopyBlock, dracula } from 'react-code-blocks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  showLineNumbers = true,
  className = 'h-full',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative rounded-lg overflow-hidden border border-gray-700', className)}>
      <div className="absolute right-2 top-2  z-10">
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="xs"
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <CopyIcon className="h-4 w-4 text-gray-400 group-hover:text-white" />
          )}
        </Button>
      </div>
      <div className="overflow-auto h-full">
        <CopyBlock
          text={code}
          language={language}
          showLineNumbers={showLineNumbers}
          theme={dracula}
          codeBlock
          customStyle={{
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </div>
    </div>
  );
};

export default CodeBlock;

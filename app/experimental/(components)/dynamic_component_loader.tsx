'use client';

import * as babel from '@babel/standalone';
import { Code } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import CodeBlock from './code_block';
interface DynamicComponentLoaderProps {
  componentCode: string;
  dependencies?: Record<string, any>;
  componentProps?: string | null;
}

const DynamicComponentLoader: React.FC<DynamicComponentLoaderProps> = ({
  componentCode,
  dependencies = {},
  componentProps,
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Transform JSX to JavaScript
      const transformedCode = babel.transform(componentCode, {
        presets: ['react'],
      }).code;

      // Create a function that will evaluate the component code
      const functionBody = `
        try {
          const {${Object.keys(dependencies).join(', ')}} = dependencies;
          const ComponentFunction = ${transformedCode};
          return ComponentFunction(dependencies, props);
        } catch (error) {
          console.error('Error in component evaluation:', error);
          throw error;
        }
      `;

      // Execute the code in a new context with React and dependencies
      const executeCode = new Function('React', 'dependencies', 'props', functionBody);
      const DynamicComponent = executeCode(React, dependencies, componentProps);

      if (typeof DynamicComponent !== 'function') {
        throw new Error('Component code did not return a valid React component');
      }

      setComponent(() => DynamicComponent);
      setError(null);
    } catch (err) {
      console.error('Error loading component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load component');
    }
  }, [componentCode, dependencies, componentProps]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!Component) {
    return <div>Loading component...</div>;
  }

  try {
    return (
      <div className="flex gap-2 items-start w-full">
        <Component {...(componentProps ? JSON.parse(componentProps) : {})} />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Show component code">
              <Code className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-1/2 max-h-full pb-10 bg-gray-600  border-zinc-800">
            <SheetHeader className="-mt-2 mb-2 ">
              <SheetTitle className="font-bold text-xs uppercase text-zinc-300">
                Component props
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 h-full">
              {componentProps && <CodeBlock code={componentProps} className="h-fit " />}
              <SheetTitle className="font-bold text-xs uppercase text-zinc-300">
                Component Code
              </SheetTitle>
              <CodeBlock code={componentCode} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  } catch (err) {
    console.error('Error rendering component:', err);
    return <div className="text-red-500">Error rendering component</div>;
  }
};

export default DynamicComponentLoader;

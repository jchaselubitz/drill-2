'use client';

import React, { useEffect, useState } from 'react';
import * as babel from '@babel/standalone';

interface DynamicComponentLoaderProps {
  componentCode: string;
  props?: Record<string, any>;
  dependencies?: Record<string, any>;
  componentProps?: string | null;
}

const DynamicComponentLoader: React.FC<DynamicComponentLoaderProps> = ({
  componentCode,
  props = {},
  dependencies = {},
  componentProps = {},
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log(componentProps);

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
          return ComponentFunction(dependencies);
        } catch (error) {
          console.error('Error in component evaluation:', error);
          throw error;
        }
      `;

      // Execute the code in a new context with React and dependencies
      const executeCode = new Function('React', 'dependencies', functionBody);
      const DynamicComponent = executeCode(React, dependencies);

      if (typeof DynamicComponent !== 'function') {
        throw new Error('Component code did not return a valid React component');
      }

      setComponent(() => DynamicComponent);
      setError(null);
    } catch (err) {
      console.error('Error loading component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load component');
    }
  }, [componentCode, dependencies]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!Component) {
    return <div>Loading component...</div>;
  }

  try {
    return <Component {...props} />;
  } catch (err) {
    console.error('Error rendering component:', err);
    return <div className="text-red-500">Error rendering component</div>;
  }
};

export default DynamicComponentLoader;

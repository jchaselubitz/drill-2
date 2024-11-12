import React from 'react';
import { LoadingButton } from '@/components/ui/button-loading';
import { cn } from '@/lib/utils';

import LightSuggestion from './light_suggestion';

interface LightSuggestionListProps {
  suggestions: string[];
  isLoading: boolean;
  includeSuggestionCreator: boolean;
  handleGenerateLessonSuggestions: () => void;
  setMaterialSuggestion: (suggestion: string) => void;
}

const LightSuggestionList: React.FC<LightSuggestionListProps> = ({
  suggestions,
  isLoading,
  includeSuggestionCreator,
  handleGenerateLessonSuggestions,
  setMaterialSuggestion,
}) => {
  const mainClass =
    'flex-col justify-start items-center rounded-lg border border-blue-300 bg-blue-100 bg-opacity-70 text-blue-800 font-semibold text-sm min-w-max hover:text-blue-100 hover:bg-opacity-80 transition-all';

  return (
    <div className="flex flex-row md:flex-wrap gap-4 my-4 overflow-x-scroll">
      {suggestions.map((suggestion, index) => (
        <LightSuggestion
          key={index}
          suggestion={suggestion}
          setMaterialSuggestion={setMaterialSuggestion}
        />
      ))}
      {includeSuggestionCreator && (
        <LoadingButton
          className={cn('hidden md:flex', mainClass)}
          buttonState={isLoading ? 'loading' : 'default'}
          text="Generate suggestions based on language and level"
          loadingText="Generating..."
          onClick={handleGenerateLessonSuggestions}
          type="submit"
        />
      )}
      {includeSuggestionCreator && (
        <div className="flex md:hidden">
          <LoadingButton
            className={cn(mainClass)}
            buttonState={isLoading ? 'loading' : 'default'}
            text="Generate suggestions based on language and level"
            loadingText="Generating..."
            onClick={handleGenerateLessonSuggestions}
            type="submit"
          />
        </div>
      )}
    </div>
  );
};

export default LightSuggestionList;

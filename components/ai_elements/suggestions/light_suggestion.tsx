import React from 'react';

interface LightSuggestionProps {
  suggestion: string;
  setMaterialSuggestion: (suggestion: string) => void;
}

const LightSuggestion: React.FC<LightSuggestionProps> = ({ suggestion, setMaterialSuggestion }) => {
  return (
    <button
      className="flex flex-col justify-start p-4 rounded-lg border border-gray-200 bg-slate-100 bg-opacity-50 text-slate-800 font-semibold text-sm min-w-max hover:bg-opacity-100 transition-all"
      onClick={() => setMaterialSuggestion(suggestion)}
    >
      <p className="text-xs text-gray-500 mb-1">{`Suggestion:`}</p>
      <p>"{`${suggestion}`}"</p>
    </button>
  );
};

export default LightSuggestion;

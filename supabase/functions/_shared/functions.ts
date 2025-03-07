import { functionDefinitions, typeDefinitions, designDefinitions } from './symbol_definitions.ts';

export const createSystemPrompt = (dependencies: string) => {
  return `Your job is to return a working React component paired with the appropriate data. This component should accept the data as props. Any execution of functions MUST be done through user interaction.
 
 Here are functions you can use:
 ${JSON.stringify(functionDefinitions.map((symbol) => `${symbol.symbol} (${symbol.type}): ${symbol.definition}`))} 
 Here are types you can use:
 ${JSON.stringify(typeDefinitions.map((symbol) => `${symbol.symbol} (${symbol.type}): ${symbol.definition}`))} 
 Design sources:
 ${JSON.stringify(designDefinitions.map((symbol) => `${symbol.name}: ${symbol.content}`))} 

 Every response must include exactly three key/value pairs:

- **componentType**: a string representing the type of component
- **props**: the data for the component
- **react_node**: a React component using the design sources. Should be full-width. Use safe parsing of props and include a fallback if no props are provided. It should take the form of a string containing EXACTLY this format:
\`\`\`
(dependencies, props) => {
const { ${dependencies} } = dependencies;

// Component data here
const ComponentName = (props = providedProps) => {
 // Component implementation
 return (
   // JSX here
 );
};

return ComponentName;
}
\`\`\`


Do not add any additional wrapping, parentheses, or modifications to this format. Return a JSON object.  
`;
};

type functionType = {
  code: string;
  purpose: string;
};

export const componentRequestPrompt = ({
  functions,
  types,
}: {
  functions: functionType[];
  types: string[];
}): string => {
  const prompt = `Consider this information about my code:

 Relevant types include: [${types}]
 Accessible functions include: [${functions}]
 
.
 
 `;
  return prompt;
};

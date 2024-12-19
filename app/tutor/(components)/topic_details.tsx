'use client';

import { BaseTutorTopic } from 'kysely-codegen';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/contexts/user_context';
import { generateTutorPrompt } from '@/lib/helpers/helpersAI';
import { LanguagesISO639 } from '@/lib/lists';

interface TopicDetailsProps {
  topic: BaseTutorTopic;
  relevantPhrases: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ topic, relevantPhrases }) => {
  const { lang: topicLanguage, level, instructions } = topic;
  const { userLanguage, prefLanguage } = useUserContext();
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  const preparedPhrases = relevantPhrases.map((phrase: any) => phrase.text);

  const handleInitiateLesson = async () => {
    if (!userLanguage || !topicLanguage || !level || !instructions) {
      alert('Missing information. Please try again.');
      return;
    }
    try {
      const prompt = await generateTutorPrompt({
        relatedPhraseArray: JSON.stringify(preparedPhrases),
        userLanguage,
        topicLanguage: (topicLanguage as LanguagesISO639) ?? prefLanguage,
        level,
        instructions,
      });
      setPrompt(prompt);
    } catch (error: any) {
      throw new Error('Error:', error);
    }
  };

  const handleResponseChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div>
      <h2>Writing Prompt</h2>
      <Button onClick={handleInitiateLesson}>Initiate Lesson</Button>
      <p>{prompt}</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={response}
          onChange={handleResponseChange}
          rows={10}
          cols={50}
          placeholder="Write your response here..."
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TopicDetails;

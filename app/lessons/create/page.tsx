import React from 'react';

import LessonCreationForm from '../(components)/lesson_creation_form';

const LessonCreationPage = () => {
  return (
    <div className="flex flex-col m-2 md:m-4 gap-4 w-full">
      <LessonCreationForm startOpen />
    </div>
  );
};

export default LessonCreationPage;

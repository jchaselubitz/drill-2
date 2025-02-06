import React from 'react';

import SubjectCreateForm from '../(components)/subject_form';

const LessonCreationPage = () => {
  return (
    <div className="flex flex-col m-2 md:m-4 gap-4 w-full">
      <SubjectCreateForm startOpen />
    </div>
  );
};

export default LessonCreationPage;

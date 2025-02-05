import React from 'react';

const DeveloperPlug: React.FC = () => {
  return (
    <a
      href="https://cooperativ.io/?utm_source=drill"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col w-full p-2 text-sm border rounded-lg bg-slate-50 hover:shadow-lg cursor-pointer mt-2 hover:underline"
    >
      <span className="hidden md:flex items-center gap-2">
        Created by <img src="/icons/cooperativ_logo.png" className="h-6" />
        Cooperativ Labs
      </span>{' '}
      <span className="md:hidden flex items-center  gap-2">
        <img src="/icons/cooperativ_logo.png" className="h-6" />
        Cooperativ Labs
      </span>
      <span className="flex items-center text-xs gap-2">Custom software development</span>
    </a>
  );
};

export default DeveloperPlug;

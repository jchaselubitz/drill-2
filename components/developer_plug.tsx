import React from 'react';

const DeveloperPlug: React.FC = () => {
  return (
    <a
      href="https://cooperativ.io/?utm_source=drill"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col w-full p-2 text-sm border rounded-lg bg-slate-50 hover:shadow-lg cursor-pointer mt-2 hover:underline"
    >
      <span className="flex items-center gap-2">Created by Jake</span>
      <span className="items-center gap-2">
        <span className="text-xs flex gap-2 items-center">
          Cooperativ Labs <img src="/icons/cooperativ_logo.png" className="h-6" />
        </span>
      </span>
    </a>
  );
};

export default DeveloperPlug;

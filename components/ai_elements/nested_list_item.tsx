import React, { useState } from 'react';
import { Button } from '../ui/button';

interface NestedListItemProps {
  value: any;
  parentKeys?: string[];
  command?: string;
  saveContent: (content: string) => Promise<boolean>;
}

const NestedListItem: React.FC<NestedListItemProps> = ({ value, command = '', saveContent }) => {
  const [saved, setSaved] = useState(false);

  const handleSave = async (content: string) => {
    const success = await saveContent(content);
    if (success) {
      setSaved(true);
    }
  };

  return (
    <div className="flex items-center justify-between border border-gray-300 rounded p-2 hover:bg-gray-100">
      <span>{value}</span>
      {command !== 'Explain' && (
        <Button disabled={saved} onClick={() => handleSave(value)}>
          {saved ? 'Saved' : 'Save'}
        </Button>
      )}
    </div>
  );
};

export default NestedListItem;

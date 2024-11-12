import React from 'react';
import { GenResponseType } from '@/lib/actions/phraseActions';

import NestedListItem from './nested_list_item';

type NestedObjectProps = {
  data: GenResponseType;
  command?: string;
  parentKeys?: string[];
  saveContent: (content: string) => Promise<boolean>;
};

const isObject = (value: any): value is GenResponseType => {
  return value && typeof value === 'object';
};

const chainParentKeys = (parentKeys: string[], key: string) => {
  return [...parentKeys, key];
};

const NestedObject: React.FC<NestedObjectProps> = ({
  data,
  command = '',
  parentKeys = [],
  saveContent,
}) => {
  if (!isObject(data)) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {Object.entries(data).map(([key, value]) => (
        <React.Fragment key={key}>
          {isObject(value) ? (
            <div className="my-2">
              <strong className="capitalize">{key}:</strong>
              <div className="ml-2 md:ml-4">
                <NestedObject
                  data={value}
                  parentKeys={chainParentKeys(parentKeys, key)}
                  saveContent={saveContent}
                  command={command}
                />
              </div>
            </div>
          ) : (
            <li>
              <NestedListItem
                value={value}
                parentKeys={parentKeys}
                saveContent={saveContent}
                command={command}
              />
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default NestedObject;

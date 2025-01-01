import React from 'react';
import { GeneralResponseType } from '@/lib/actions/phraseActions';
import { LanguagesISO639 } from '@/lib/lists';

import NestedListItem from './nested_list_item';

type NestedObjectProps = {
  data: GeneralResponseType;
  parentKeys?: string[];
  source?: string;
  lang: LanguagesISO639;
  associatedPhraseId?: string;
};

const isObject = (value: any): value is GeneralResponseType => {
  return value && typeof value === 'object';
};

const chainParentKeys = (parentKeys: string[], key: string) => {
  return [...parentKeys, key];
};

const NestedObject: React.FC<NestedObjectProps> = ({
  data,
  parentKeys = [],
  lang,
  source,
  associatedPhraseId,
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
                  lang={lang}
                  source={source}
                  associatedPhraseId={associatedPhraseId}
                />
              </div>
            </div>
          ) : (
            <li>
              <NestedListItem
                value={value}
                parentKeys={parentKeys}
                source={source}
                lang={lang}
                associatedPhraseId={associatedPhraseId}
              />
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default NestedObject;

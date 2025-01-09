import { Iso639LanguageCode } from 'kysely-codegen';
import React from 'react';
import { GeneralResponseType } from '@/lib/actions/phraseActions';
import { SourceOptionType } from '@/lib/lists';

import NestedListItem from './nested_list_item';

type NestedObjectProps = {
  data: GeneralResponseType;
  parentKeys?: string[];
  source: SourceOptionType;
  lang: Iso639LanguageCode;
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
    <div className="flex flex-col gap-2 w-full">
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
            <div className="w-full">
              <NestedListItem
                value={value}
                parentKeys={parentKeys}
                source={source}
                lang={lang}
                associatedPhraseId={associatedPhraseId}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NestedObject;

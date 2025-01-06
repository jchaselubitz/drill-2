import { Iso639LanguageCode } from 'kysely-codegen';
import { updateUserLanguage } from '../actions/userActions';

export const setUserLanguages = async ({
  lang,
  name,
  prefLanguage,
  userLanguage,
}: {
  lang: Iso639LanguageCode;
  name: string;
  prefLanguage: Iso639LanguageCode | undefined | null;
  userLanguage: Iso639LanguageCode | undefined | null;
}) => {
  if (name === 'userLanguage') {
    await updateUserLanguage({
      userLanguage: lang,
      prefLanguage: prefLanguage ?? null,
    });
  }
  if (name === 'prefLanguage') {
    await updateUserLanguage({
      userLanguage: userLanguage ?? null,
      prefLanguage: lang,
    });
  }
};

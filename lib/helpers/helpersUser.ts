import { updateUserLanguage } from '../actions/userActions';
import { LanguagesISO639 } from '../lists';

export const setUserLanguages = async ({
  lang,
  name,
  prefLanguage,
  userLanguage,
}: {
  lang: LanguagesISO639;
  name: string;
  prefLanguage: LanguagesISO639 | undefined | null;
  userLanguage: LanguagesISO639 | undefined | null;
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

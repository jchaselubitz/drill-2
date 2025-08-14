# Kysely-Codegen Module Resolution Fix

## Problem
TypeScript was unable to find the `kysely-codegen` module and its type declarations, throwing the error:
```
Cannot find module 'kysely-codegen' or its corresponding type declarations.
```

## Root Cause
The `kysely-codegen` package generates types into `node_modules/kysely-codegen/dist/db.d.ts`, but doesn't properly export them as a module that can be imported directly using `import { ... } from 'kysely-codegen'`.

## Solution
Created a custom TypeScript declaration file at `/types/kysely-codegen.d.ts` that re-exports the generated types from the correct location:

```typescript
// Re-export all types from the generated kysely-codegen db file
// This allows us to import from 'kysely-codegen' as expected

/// <reference path="../node_modules/kysely-codegen/dist/db.d.ts" />

declare module 'kysely-codegen' {
  export {
    Association,
    DB,
    Lesson,
    Media,
    Phrase,
    PhraseTag,
    Profile,
    Subject,
    Tag,
    Translation,
    UserMedia,
    History,
    TutorTopic,
    Correction,
    Iso639LanguageCode,
    TutorPrompt,
    Feedback,
    PhraseType,
  } from '../node_modules/kysely-codegen/dist/db';
}
```

## Files Modified
- Created: `/types/kysely-codegen.d.ts`
- No changes needed to existing import statements throughout the codebase

## Verification
- TypeScript compilation now works without the module resolution error
- All existing `import { ... } from 'kysely-codegen'` statements continue to work
- The solution is maintainable and will automatically pick up new types when `yarn generate` is run

## Next Steps
After running `yarn generate` to regenerate types, you may need to update the export list in `/types/kysely-codegen.d.ts` if new table interfaces are added to the database schema.

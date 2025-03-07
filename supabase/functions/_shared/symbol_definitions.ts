// This file is auto-generated. Do not edit manually.
// Generated on 2025-03-06T12:13:22.101Z
// Source: app/experimental/utils/componentDependencies.ts

export const functionDefinitions = [
  {
    "symbol": "addTranslation",
    "type": "function",
    "definition": "({ primaryPhraseIds, genResponse, source, revalidationPath, phraseType, }: AddTranslationProps) => Promise<never[] | undefined>"
  },
  {
    "symbol": "addPhrase",
    "type": "function",
    "definition": "({ text, lang, source, filename, type: rawType, associationId, }: { text: string; lang: Iso639LanguageCode; source?: string | undefined; filename?: string | undefined; type: PhraseType; associationId?: string | undefined; }) => Promise<void>"
  },
  {
    "symbol": "getHumanDate",
    "type": "function",
    "definition": "(date: Date) => string"
  },
  {
    "symbol": "getLangName",
    "type": "function",
    "definition": "(langCode: string | null | undefined) => string"
  },
  {
    "symbol": "getLangValue",
    "type": "function",
    "definition": "(langName: string) => LanguagesISO639 | null"
  },
  {
    "symbol": "getLangIcon",
    "type": "function",
    "definition": "(langCode: string | null) => string"
  }
] as const;

export const typeDefinitions = [
  {
    "symbol": "SourceOptionType",
    "type": "type",
    "definition": "\"home\" | \"history\" | \"lesson\" | \"correction\" | \"transcript\" | \"chat\""
  },
  {
    "symbol": "PhraseType",
    "type": "type",
    "definition": "\"phrase\" | \"recording\" | \"word\""
  },
  {
    "symbol": "Iso639LanguageCode",
    "type": "type",
    "definition": "\"ISO 639 Language Codes\""
  },
  {
    "symbol": "NewAssociation",
    "type": "type",
    "definition": "{ phrasePrimaryId: string | number | bigint; phraseSecondaryId: string | number | bigint; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; }"
  },
  {
    "symbol": "NewPhrase",
    "type": "type",
    "definition": "{ lang: Iso639LanguageCode; text: string; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; difficulty?: number | null | undefined; favorite?: boolean | undefined; filename?: string | null | undefined; historyId?: string | number | bigint | null | undefined; note?: string | null | undefined; partSpeech?: string | null | undefined; source?: string | undefined; type?: \"phrase\" | \"recording\" | \"word\" | undefined; userId?: string | null | undefined; }"
  },
  {
    "symbol": "NewPhraseTag",
    "type": "type",
    "definition": "{} & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; phraseId?: string | number | bigint | null | undefined; tagId?: string | number | bigint | null | undefined; }"
  },
  {
    "symbol": "NewTag",
    "type": "type",
    "definition": "{ label: string; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; userId?: string | null | undefined; }"
  },
  {
    "symbol": "NewTranslation",
    "type": "type",
    "definition": "{ phrasePrimaryId: string | number | bigint; phraseSecondaryId: string | number | bigint; userId: string; } & { createdAt?: string | Date | undefined; id?: string | number | bigint | undefined; lessonId?: string | number | bigint | null | undefined; }"
  },
  {
    "symbol": "AddTranslationProps",
    "type": "type",
    "definition": "{ primaryPhraseIds?: string[]; genResponse: TranslationResponseType; source: SourceOptionType; revalidationPath?: RevalidationPath; phraseType?: PhraseType; }"
  },
  {
    "symbol": "TranslationResponseType",
    "type": "type",
    "definition": "{ input_text: string; input_lang: string; output_text: string; output_lang: string; }"
  },
  {
    "symbol": "SubjectWithLessons",
    "type": "type",
    "definition": "{ createdAt: Date; id: string; lang: Iso639LanguageCode; level: string | null; name: string | null; userId: string | null; } & { lessons: BaseLesson[]; }"
  }
] as const;

export const designDefinitions = [
  {
    "name": "css",
    "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  font-family: Arial, Helvetica, sans-serif;\n}\n\n@layer base {\n  :root {\n    --radius: 0.5rem;\n    --sidebar-background: 0 0% 98%;\n    --sidebar-foreground: 240 5.3% 26.1%;\n    --sidebar-primary: 240 5.9% 10%;\n    --sidebar-primary-foreground: 0 0% 98%;\n    --sidebar-accent: 240 4.8% 95.9%;\n    --sidebar-accent-foreground: 240 5.9% 10%;\n    --sidebar-border: 220 13% 91%;\n    --sidebar-ring: 217.2 91.2% 59.8%;\n  }\n  .dark {\n    --sidebar-background: 240 5.9% 10%;\n    --sidebar-foreground: 240 4.8% 95.9%;\n    --sidebar-primary: 224.3 76.3% 48%;\n    --sidebar-primary-foreground: 0 0% 100%;\n    --sidebar-accent: 240 3.7% 15.9%;\n    --sidebar-accent-foreground: 240 4.8% 95.9%;\n    --sidebar-border: 240 3.7% 15.9%;\n    --sidebar-ring: 217.2 91.2% 59.8%;\n  }\n}\n"
  },
  {
    "name": "tailwind",
    "content": "import type { Config } from 'tailwindcss';\n\nconst config: Config = {\n  darkMode: ['class'],\n  content: [\n    './pages/**/*.{js,ts,jsx,tsx,mdx}',\n    './components/**/*.{js,ts,jsx,tsx,mdx}',\n    './app/**/*.{js,ts,jsx,tsx,mdx}',\n  ],\n  theme: {\n    extend: {\n      rounded: {\n        '5xl': 'calc(var(--radius) - 2px)',\n      },\n      colors: {\n        background: 'var(--background)',\n        foreground: 'var(--foreground)',\n        sidebar: {\n          DEFAULT: 'hsl(var(--sidebar-background))',\n          foreground: 'hsl(var(--sidebar-foreground))',\n          primary: 'hsl(var(--sidebar-primary))',\n          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',\n          accent: 'hsl(var(--sidebar-accent))',\n          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',\n          border: 'hsl(var(--sidebar-border))',\n          ring: 'hsl(var(--sidebar-ring))',\n        },\n      },\n      boxShadow: {\n        smallAbove: '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',\n      },\n\n      borderRadius: {\n        iPhone: 'calc(var(--radius) + 35px)',\n        lg: 'var(--radius)',\n        md: 'calc(var(--radius) - 2px)',\n        sm: 'calc(var(--radius) - 4px)',\n      },\n      keyframes: {\n        'accordion-down': {\n          from: {\n            height: '0',\n          },\n          to: {\n            height: 'var(--radix-accordion-content-height)',\n          },\n        },\n        'accordion-up': {\n          from: {\n            height: 'var(--radix-accordion-content-height)',\n          },\n          to: {\n            height: '0',\n          },\n        },\n      },\n      animation: {\n        'accordion-down': 'accordion-down 0.2s ease-out',\n        'accordion-up': 'accordion-up 0.2s ease-out',\n      },\n    },\n  },\n  plugins: [\n    require('tailwindcss-animate'),\n    require('@tailwindcss/typography'),\n    require('tailwindcss-safe-area'),\n  ],\n};\nexport default config;\n"
  },
  {
    "name": "tailwindVersion",
    "content": "3.4.1"
  },
  {
    "name": "shadcn/ui",
    "content": "{\n  \"$schema\": \"https://ui.shadcn.com/schema.json\",\n  \"style\": \"default\",\n  \"rsc\": true,\n  \"tsx\": true,\n  \"tailwind\": {\n    \"config\": \"tailwind.config.ts\",\n    \"css\": \"./app/globals.css\",\n    \"baseColor\": \"zinc\",\n    \"cssVariables\": false,\n    \"prefix\": \"\"\n  },\n  \"aliases\": {\n    \"components\": \"@/components\",\n    \"utils\": \"@/lib/utils\",\n    \"ui\": \"@/components/ui\",\n    \"lib\": \"@/lib\",\n    \"hooks\": \"@/hooks\"\n  }\n}\n"
  }
] as const;

export type FunctionDefinition = typeof functionDefinitions[number];
export type TypeDefinition = typeof typeDefinitions[number];
export type DesignDefinition = typeof designDefinitions[number];

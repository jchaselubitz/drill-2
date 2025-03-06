#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { Project, Node, Type, TypeFormatFlags, Symbol as TsMorphSymbol, ts } from 'ts-morph';
import { symbolExpander } from './symbolExpander';

const IGNORED_SYMBOLS = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo'] as const;

interface SymbolInfo {
  symbol: string;
  type: 'function' | 'type' | 'interface' | 'value';
  definition: string;
}

function getFullTypeDefinition(type: Type, sourceFile: Node): string {
  // For aliased types, get the actual type declaration
  if (type.isTypeParameter() || type.getText(sourceFile) === type.getSymbol()?.getName()) {
    const symbol = type.getSymbol();
    if (symbol) {
      const declarations = symbol.getDeclarations();
      if (declarations.length > 0 && Node.isTypeAliasDeclaration(declarations[0])) {
        const aliasedType = declarations[0].getType();
        return getFullTypeDefinition(aliasedType, sourceFile);
      }
    }
  }

  // Get the full type text without import references
  const typeText = type.getText(
    sourceFile,
    TypeFormatFlags.NoTruncation | TypeFormatFlags.InTypeAlias | TypeFormatFlags.NoTypeReduction
  );

  // If it's a simple type (like string, number, etc.) or a complex type (like an object), return as is
  if (!type.isObject() || type.getText(sourceFile).includes('{')) {
    return typeText;
  }

  // For object types, get their properties and build the type definition
  const properties = type.getProperties();
  if (properties.length === 0) {
    return typeText;
  }

  const propertyDefinitions = properties.map((prop) => {
    const propType = prop.getTypeAtLocation(sourceFile);
    const propTypeText = getFullTypeDefinition(propType, sourceFile);
    const isOptional = (prop.getFlags() & ts.SymbolFlags.Optional) !== 0;
    return `${prop.getName()}${isOptional ? '?' : ''}: ${propTypeText}`;
  });

  return `{\n  ${propertyDefinitions.join(';\n  ')};\n}`;
}

function extractExportsFromFile(filePath: string): {
  functionDefinitions: SymbolInfo[];
  typeDefinitions: SymbolInfo[];
} {
  const fPath = filePath ? filePath : 'app/experimental/utils/componentDependencies.ts';
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
  });

  const sourceFile = project.addSourceFileAtPath(fPath);
  const functionDefinitions: SymbolInfo[] = [];
  const typeDefinitions: SymbolInfo[] = [];

  // Get named exports (both types and values)
  const namedExports = sourceFile.getExportedDeclarations();

  namedExports.forEach((declarations, name) => {
    if (name === 'default' || IGNORED_SYMBOLS.includes(name as any)) {
      return;
    }

    declarations.forEach((declaration) => {
      if (Node.isTypeAliasDeclaration(declaration)) {
        const typeDefinition = getFullTypeDefinition(declaration.getType(), declaration);
        typeDefinitions.push({
          symbol: name,
          type: 'type',
          definition: typeDefinition,
        });
      } else if (Node.isInterfaceDeclaration(declaration)) {
        const typeDefinition = getFullTypeDefinition(declaration.getType(), declaration);
        typeDefinitions.push({
          symbol: name,
          type: 'interface',
          definition: typeDefinition,
        });
      } else {
        const definition = symbolExpander.expandSymbol(name);
        if (definition) {
          if (definition.type === 'function') {
            functionDefinitions.push({
              symbol: name,
              type: definition.type,
              definition: definition.definition,
            });
          } else {
            typeDefinitions.push({
              symbol: name,
              type: definition.type,
              definition: definition.definition,
            });
          }
        } else {
          console.warn(`Warning: Could not find definition for symbol "${name}"`);
        }
      }
    });
  });

  return { functionDefinitions, typeDefinitions };
}

function generateSymbolDefinitions(sourceFilePath: string) {
  console.log(`Extracting exports from: ${sourceFilePath}`);
  const { functionDefinitions, typeDefinitions } = extractExportsFromFile(sourceFilePath);
  console.log(
    `Found ${functionDefinitions.length} functions and ${typeDefinitions.length} types to process`
  );

  // Create the output file content
  const fileContent = `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}
// Source: ${sourceFilePath}

export const functionDefinitions = ${JSON.stringify(functionDefinitions, null, 2)} as const;

export const typeDefinitions = ${JSON.stringify(typeDefinitions, null, 2)} as const;

export type FunctionDefinition = typeof functionDefinitions[number];
export type TypeDefinition = typeof typeDefinitions[number];
`;

  // Ensure the directory exists
  const outputPath = path.join(process.cwd(), 'supabase/functions/_shared/symbol_definitions.ts');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`✓ Symbol definitions written to: ${outputPath}`);
  console.log(
    `Processed ${functionDefinitions.length} functions and ${typeDefinitions.length} types`
  );
}

// Default to componentDependencies.ts if no file is specified
const sourceFilePath = process.argv[2] || 'app/experimental/utils/componentDependencies.ts';

if (!fs.existsSync(sourceFilePath)) {
  console.error(`Error: File not found: ${sourceFilePath}`);
  console.error('Usage: yarn gen:symbols [fPath]');
  console.error('Default: app/experimental/utils/componentDependencies.ts');
  process.exit(1);
}

generateSymbolDefinitions(sourceFilePath);

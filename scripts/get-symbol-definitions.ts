#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { Project, Node, Type, TypeFormatFlags, ts } from 'ts-morph';
import { symbolExpander } from './symbolExpander';

// Load config
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const IGNORED_SYMBOLS = config.ignoredSymbols as string[];

interface SymbolInfo {
  symbol: string;
  type: 'function' | 'type' | 'interface' | 'value';
  definition: string;
}

interface DesignSource {
  name: string;
  content: string;
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

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch (error) {
    console.warn(`Warning: Could not read file at ${filePath}`);
    return '';
  }
}

function getDesignDefinitions(): DesignSource[] {
  const designSources: DesignSource[] = [];

  // Add CSS
  if (config.designSources.css) {
    designSources.push({
      name: 'css',
      content: readFileContent(config.designSources.css),
    });
  }

  // Add Tailwind config
  if (config.designSources.tailwind?.config) {
    designSources.push({
      name: 'tailwind',
      content: readFileContent(config.designSources.tailwind.config),
    });
  }

  // Add Tailwind version
  if (config.designSources.tailwind?.version) {
    designSources.push({
      name: 'tailwindVersion',
      content: config.designSources.tailwind.version,
    });
  }

  // Add other sources
  if (config.designSources.other) {
    config.designSources.other.forEach((source: { name: string; path: string }) => {
      designSources.push({
        name: source.name,
        content: readFileContent(source.path),
      });
    });
  }

  return designSources;
}

function extractExportsFromFile(filePath: string): {
  functionDefinitions: SymbolInfo[];
  typeDefinitions: SymbolInfo[];
} {
  const fPath = filePath ? filePath : config.defaultSourceFile;
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
  const designDefinitions = getDesignDefinitions();

  console.log(
    `Found ${functionDefinitions.length} functions, ${typeDefinitions.length} types, and ${designDefinitions.length} design sources to process`
  );

  // Create the output file content
  const fileContent = `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}
// Source: ${sourceFilePath}

export const functionDefinitions = ${JSON.stringify(functionDefinitions, null, 2)} as const;

export const typeDefinitions = ${JSON.stringify(typeDefinitions, null, 2)} as const;

export const designDefinitions = ${JSON.stringify(designDefinitions, null, 2)} as const;

export type FunctionDefinition = typeof functionDefinitions[number];
export type TypeDefinition = typeof typeDefinitions[number];
export type DesignDefinition = typeof designDefinitions[number];
`;

  // Ensure the directory exists
  const outputPath = path.join(process.cwd(), config.outputPath);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`✓ Symbol definitions written to: ${outputPath}`);
  console.log(
    `Processed ${functionDefinitions.length} functions, ${typeDefinitions.length} types, and ${designDefinitions.length} design sources`
  );
}

// Default to config's defaultSourceFile if no file is specified
const sourceFilePath = process.argv[2] || config.defaultSourceFile;

if (!fs.existsSync(sourceFilePath)) {
  console.error(`Error: File not found: ${sourceFilePath}`);
  console.error('Usage: yarn gen:symbols [fPath]');
  console.error(`Default: ${config.defaultSourceFile}`);
  process.exit(1);
}

generateSymbolDefinitions(sourceFilePath);

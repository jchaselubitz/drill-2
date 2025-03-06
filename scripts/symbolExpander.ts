import {
  Project,
  TypeFormatFlags,
  Node,
  FunctionDeclaration,
  TypeAliasDeclaration,
  InterfaceDeclaration,
} from 'ts-morph';
import path from 'path';

type SymbolDefinition = {
  symbol: string;
  type: 'function' | 'type';
  definition: string;
};

class SymbolExpander {
  private project: Project;

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
    });
  }

  private getSourceFiles() {
    return this.project.getSourceFiles();
  }

  private getFunctionDefinition(node: Node): string | null {
    if (Node.isVariableDeclaration(node) || Node.isFunctionDeclaration(node)) {
      const type = node.getType();
      return type.getText(undefined, TypeFormatFlags.NoTruncation);
    }
    return null;
  }

  private getTypeDefinition(node: Node): string | null {
    if (Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node)) {
      const type = node.getType();
      return type.getText(undefined, TypeFormatFlags.NoTruncation);
    }
    return null;
  }

  public expandSymbol(symbolName: string): SymbolDefinition | null {
    for (const sourceFile of this.getSourceFiles()) {
      // Try to find as a function
      const functionDeclaration =
        sourceFile.getFunction(symbolName) || sourceFile.getVariableDeclaration(symbolName);
      if (functionDeclaration) {
        const definition = this.getFunctionDefinition(functionDeclaration);
        if (definition) {
          return {
            symbol: symbolName,
            type: 'function',
            definition,
          };
        }
      }

      // Try to find as a type
      const typeDeclaration =
        sourceFile.getTypeAlias(symbolName) || sourceFile.getInterface(symbolName);
      if (typeDeclaration) {
        const definition = this.getTypeDefinition(typeDeclaration);
        if (definition) {
          return {
            symbol: symbolName,
            type: 'type',
            definition,
          };
        }
      }
    }
    return null;
  }

  public getAllSymbols(): SymbolDefinition[] {
    const symbols: SymbolDefinition[] = [];

    for (const sourceFile of this.getSourceFiles()) {
      // Get functions
      sourceFile.getFunctions().forEach((func: FunctionDeclaration) => {
        const def = this.getFunctionDefinition(func);
        if (def) {
          symbols.push({
            symbol: func.getName() || 'anonymous',
            type: 'function',
            definition: def,
          });
        }
      });

      // Get types
      sourceFile.getTypeAliases().forEach((type: TypeAliasDeclaration) => {
        const def = this.getTypeDefinition(type);
        if (def) {
          symbols.push({
            symbol: type.getName(),
            type: 'type',
            definition: def,
          });
        }
      });

      // Get interfaces
      sourceFile.getInterfaces().forEach((iface: InterfaceDeclaration) => {
        const def = this.getTypeDefinition(iface);
        if (def) {
          symbols.push({
            symbol: iface.getName(),
            type: 'type',
            definition: def,
          });
        }
      });
    }

    return symbols;
  }
}

// Export a singleton instance
export const symbolExpander = new SymbolExpander();

// Export the main function for backwards compatibility
export function expandSymbol(symbolName: string): SymbolDefinition | null {
  return symbolExpander.expandSymbol(symbolName);
}

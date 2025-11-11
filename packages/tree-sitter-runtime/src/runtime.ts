// Native tree-sitter runtime implementation for Node.js

import Parser from 'tree-sitter';
import type { ParserRuntime, Language, SyntaxTree, ParseOptions } from './types.js';

/**
 * Node.js tree-sitter runtime adapter.
 * Wraps the native tree-sitter parser for use with our abstraction.
 */
export class NodeTreeSitterRuntime implements ParserRuntime {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  setLanguage(language: Language): void {
    this.parser.setLanguage(language);
  }

  parse(source: string, oldTree?: SyntaxTree, options?: ParseOptions): SyntaxTree {
    // Auto-detect if we need a larger buffer size
    // Default tree-sitter buffer is 32KB (32768 bytes)
    const sourceSize = source.length;
    const defaultBufferSize = 32768;

    let bufferSize = options?.bufferSize;

    // If no explicit bufferSize and source is larger than default, auto-scale
    if (!bufferSize && sourceSize > defaultBufferSize) {
      // Add 25% overhead for safety
      bufferSize = Math.ceil(sourceSize * 1.25);
    }

    const parseOptions = bufferSize ? { ...options, bufferSize } : options;

    const tree = this.parser.parse(source, oldTree as any, parseOptions as any);
    // tree-sitter Tree type is compatible with our SyntaxTree interface
    return tree;
  }
}

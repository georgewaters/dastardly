# Contributing to dASTardly

Thank you for your interest in contributing to dASTardly! This document provides guidelines and information for contributors.

## Documentation

For more information about the project:
- **ARCHITECTURE.md**: Technical design and implementation details
- **CLAUDE.md**: AI assistant context and project overview
- **README.md**: User-facing documentation

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dastardly

# Install dependencies
pnpm install

# Build all packages
pnpm -r build
```

## Project Structure

```
dastardly/
├── packages/
│   ├── core/                    # Core AST types & utilities
│   ├── tree-sitter-runtime/     # Shared tree-sitter utilities (planned)
│   ├── json/                    # JSON parser/serializer (planned)
│   └── ...                      # Other format packages
├── CLAUDE.md                    # AI assistant context
├── ARCHITECTURE.md              # Architecture documentation
└── CONTRIBUTING.md              # This file
```

## Development Workflow

### Building

```bash
# Build all packages
pnpm -r build

# Build a specific package
pnpm --filter @dastardly/core build
```

### Testing

```bash
# Run all tests
pnpm -r test

# Run tests for a specific package
pnpm --filter @dastardly/json test

# Run tests in watch mode
pnpm --filter @dastardly/json test:watch
```

### Code Quality

```bash
# Type checking
pnpm -r typecheck

# Linting (once configured)
pnpm -r lint

# Formatting (once configured)
pnpm -r format
```

## Coding Standards

### TypeScript

- **Strict mode is required** - All code must pass TypeScript strict mode
- **Use ESM** - All packages use ES modules (`"type": "module"`)
- **Explicit types** - Avoid `any`, prefer explicit typing
- **No implicit returns** - Functions should have explicit return types

### Naming Conventions

- **Files**: kebab-case (e.g., `ast-node.ts`)
- **Classes**: PascalCase (e.g., `DastardlyNode`)
- **Interfaces**: PascalCase (e.g., `SourceLocation`)
- **Functions**: camelCase (e.g., `parseJSON`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_DEPTH`)

### Code Organization

- Each package exports through a single `index.ts`
- Keep files focused and small (< 300 lines ideally)
- Group related functionality in subdirectories
- Tests should mirror source structure

### Comments

- Document **why**, not **what** (code should be self-documenting for "what")
- Use JSDoc for public APIs
- Add comments for complex algorithms or non-obvious logic

## Creating a New Package

To add support for a new format:

1. **Create the package structure**:
   ```bash
   mkdir -p packages/<format-name>/src
   cd packages/<format-name>
   ```

2. **Create package.json**:
   ```json
   {
     "name": "@dastardly/<format-name>",
     "version": "0.1.0",
     "description": "<Format> parser and serializer for dASTardly",
     "type": "module",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "test": "vitest"
     },
     "dependencies": {
       "@dastardly/core": "workspace:*",
       "tree-sitter": "^0.21.0"
     },
     "devDependencies": {
       "typescript": "^5.3.0",
       "vitest": "^1.0.0"
     }
   }
   ```

3. **Create tsconfig.json** extending root config:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": "src"
     },
     "include": ["src"]
   }
   ```

4. **Implement the parser and serializer**:
   - `src/parser.ts` - Tree-sitter integration
   - `src/serializer.ts` - AST to format conversion
   - `src/index.ts` - Public exports

5. **Write comprehensive tests**:
   - Test valid input parsing
   - Test invalid input handling
   - Test position tracking accuracy
   - Test roundtrip conversion (parse → serialize → parse)
   - Test edge cases specific to the format

6. **Create package README.md**:
   - Location: `packages/<format-name>/README.md`
   - Should document:
     - Format name and description
     - Installation instructions (npm/pnpm)
     - Basic usage examples (parsing and serializing)
     - API reference for all public functions and classes
     - Format-specific features and limitations
     - Links to related packages and main documentation
   - Use `IMPLEMENTATION_GUIDE.md` Step 8 as a template
   - Reference `packages/json/README.md` for a complete example

## Testing Guidelines

### What to Test

1. **Position Tracking**: Verify line/column/offset accuracy for every node
2. **Format Compliance**: Follow the official specification exactly
3. **Error Handling**: Graceful failures with helpful error messages
4. **Edge Cases**: Large files, unicode, special characters, nested structures
5. **Cross-format Conversion**: Verify data integrity when converting between formats

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { parseJSON } from './parser';

describe('JSON Parser', () => {
  describe('position tracking', () => {
    it('tracks object positions correctly', () => {
      const source = '{"key": "value"}';
      const ast = parseJSON(source);
      expect(ast.loc.start.line).toBe(1);
      expect(ast.loc.start.column).toBe(0);
      // ...
    });
  });

  describe('error handling', () => {
    it('reports helpful errors for invalid JSON', () => {
      expect(() => parseJSON('{invalid}')).toThrow(/position/);
    });
  });
});
```

## Performance Considerations

This library is designed for **real-time editor feedback**, so performance is critical:

1. **Use tree-sitter** - Don't write custom parsers
2. **Leverage incremental parsing** - Only re-parse changed sections
3. **Avoid unnecessary allocations** - Reuse objects where possible
4. **Benchmark new features** - Ensure no performance regressions
5. **Profile before optimizing** - Measure first, optimize second

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This enables automatic versioning and changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature (triggers minor version bump)
- **fix**: Bug fix (triggers patch version bump)
- **docs**: Documentation changes only
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring without changing behavior
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files

### Scopes

- **core**: Changes to `@dastardly/core`
- **json**: Changes to `@dastardly/json`
- **yaml**: Changes to `@dastardly/yaml`
- **runtime**: Changes to `@dastardly/tree-sitter-runtime`
- **docs**: Documentation changes
- **repo**: Repository-level changes

### Breaking Changes

Add `BREAKING CHANGE:` in the footer or append `!` after the type/scope:

```
feat(core)!: redesign AST node structure

BREAKING CHANGE: Node constructors now require different parameters
```

This triggers a major version bump.

### Examples

```
feat(json): add JSON parser implementation
fix(core): correct position tracking in nested objects
docs(readme): update installation instructions
chore(deps): upgrade tree-sitter to v0.21.0
```

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Write tests** for new functionality
3. **Ensure all tests pass**: `pnpm -r test`
4. **Ensure type checking passes**: `pnpm -r build`
5. **Update documentation** if adding new features
6. **Follow commit message conventions** (see above)
7. **Submit PR** with a clear description of changes

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Motivation
Why is this change needed?

## Changes
- List of specific changes made
- ...

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated (README.md created for new packages)
- [ ] All tests passing
- [ ] TypeScript strict mode passing
```

## Design Principles

When contributing, keep these principles in mind:

1. **Position Preservation**: Never lose source location information
2. **Format Correctness**: Follow specifications exactly
3. **Performance**: Optimize for real-time editing
4. **Clarity**: Code should be readable and maintainable
5. **Error Messages**: Users need precise, helpful error information

## Questions?

- Check `ARCHITECTURE.md` for design details
- Check `CLAUDE.md` for project context
- Open an issue for discussion

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

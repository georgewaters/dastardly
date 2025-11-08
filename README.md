# dASTardly

A high-performance data format parser and serializer that uses a common AST (Abstract Syntax Tree) to enable cross-format conversion and validation. Built with Tree-sitter for real-time editor performance.

## Features

- **Cross-format conversion**: Seamlessly convert between JSON, YAML, and more
- **Position tracking**: Accurate source locations for every node
- **Real-time performance**: Optimized for editor integrations
- **Type-safe**: Full TypeScript support with strict mode
- **Extensible**: Easy to add new format support

## Testing

### Unit Tests

Each package has comprehensive unit tests covering parsers, serializers, and utilities:

```bash
# Run all tests
pnpm -r test

# Test specific package
pnpm --filter @dastardly/json test
pnpm --filter @dastardly/yaml test

# Watch mode
pnpm --filter @dastardly/core test:watch
```

### Integration Tests

Cross-format integration tests validate end-to-end functionality:

```bash
# Run integration tests
pnpm --filter @dastardly/integration-tests test

# All tests (unit + integration)
pnpm -r test
```

### Test Coverage

- **@dastardly/core**: 78 tests (AST types, builders, utilities)
- **@dastardly/tree-sitter-runtime**: 36 tests (parser infrastructure)
- **@dastardly/json**: 115 tests (JSON parsing and serialization)
- **@dastardly/yaml**: 245 tests (YAML parsing and serialization)
- **@dastardly/integration-tests**: Integration and cross-format tests

Total: **474+ unit tests** + comprehensive integration tests

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Technical design and implementation details
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Development workflow and coding standards
- **[CLAUDE.md](CLAUDE.md)**: Project context and guidelines for AI assistants

## License

MIT

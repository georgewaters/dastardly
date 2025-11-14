# 1.0.0 (2025-11-14)


### Bug Fixes

* add default export condition to package.json exports ([ec8ce08](https://github.com/thesoftwarebakery/dastardly/commit/ec8ce08bf54199697b08fb1e02228a07743115ee))
* **core:** add missing type imports and strict mode assertions ([ec05fa3](https://github.com/thesoftwarebakery/dastardly/commit/ec05fa34f84e5a544422be122085094c32011d94))
* **csv:** add source locations to all builder function calls ([8ee295c](https://github.com/thesoftwarebakery/dastardly/commit/8ee295cfe5d704c60ef7f26f333530a066020b16))
* **csv:** support date-like values and hyphens in text fields ([9ad2340](https://github.com/thesoftwarebakery/dastardly/commit/9ad234087fbc23447eab95e143b558205b5a35c0))
* **csv:** support single-character text fields ([c42645e](https://github.com/thesoftwarebakery/dastardly/commit/c42645e606c4e4cd528b84cc0e5c7977a5edd395))
* **csv:** tests for RFC 4180 compliance ([af75981](https://github.com/thesoftwarebakery/dastardly/commit/af75981e732bf78ad8e6b23ca2e6b7b34d1c2147))
* **integration-tests:** resolve final 3 CSV test failures ([86733c7](https://github.com/thesoftwarebakery/dastardly/commit/86733c76395a3598223777142ccf17b1352a3080))
* resolve 6 failing integration tests ([a2d6814](https://github.com/thesoftwarebakery/dastardly/commit/a2d68149122e36f35f3424faf99ffb00ddd195eb))
* **tree-sitter-csv:** grammar and parser updates to correctly handle spaces in CSV fields ([8c23085](https://github.com/thesoftwarebakery/dastardly/commit/8c230851cfefe18311df5c3bd73154536a8e63aa))
* **tree-sitter-csv:** upgrade to node-addon-api for tree-sitter 0.21.1 compatibility ([fe4ceb7](https://github.com/thesoftwarebakery/dastardly/commit/fe4ceb702c63310f25dd586f1f5cecab204b92e7))
* **tree-sitter-runtime:** resolve 32KB buffer size limitation ([bd5f4a8](https://github.com/thesoftwarebakery/dastardly/commit/bd5f4a89389d8434457bb802d4b8da0548a1c50b))
* **validation:** add Unicode code point counting and document test failures ([4ca5b56](https://github.com/thesoftwarebakery/dastardly/commit/4ca5b56d709f3d10586e8cb5dd897564284445c2))


* fix(core)!: refactor to proper discriminated union pattern ([f3c6d7f](https://github.com/thesoftwarebakery/dastardly/commit/f3c6d7ff790972d6cbf49660d5267496f19ad2d7))
* feat(core)!: redesign AST with modular structure ([9d99350](https://github.com/thesoftwarebakery/dastardly/commit/9d993509f01f36f54b06f5f306db9bf3d0c01b5f))


### Features

* add comprehensive integration test suite ([54fc7f9](https://github.com/thesoftwarebakery/dastardly/commit/54fc7f9aef0a2458216169c429286a1ef833ea3b))
* add parse options support to FormatPackage interface ([27ca631](https://github.com/thesoftwarebakery/dastardly/commit/27ca631c5196eaf5605ab8f7ddfc1aa1717c384b))
* **core:** add identity, pointer, and diff utilities for validation ([b3d6076](https://github.com/thesoftwarebakery/dastardly/commit/b3d6076bc45fd6fb812d868552d86a3014789728))
* **csv:** add CSV package with utilities and test infrastructure ([77e0a4d](https://github.com/thesoftwarebakery/dastardly/commit/77e0a4dadf5b6cbaf41dd8e3838e4db86b340ecd))
* **csv:** add external scanner for empty field detection ([26066f4](https://github.com/thesoftwarebakery/dastardly/commit/26066f4b3f6f200aa0618e3fc2cb6874c67a6b2e))
* **csv:** handle empty_field nodes in parser ([6890e9f](https://github.com/thesoftwarebakery/dastardly/commit/6890e9f31704233cb9bfec0c851ec2808e2a0b3a))
* **csv:** implement CSV parser with comprehensive test coverage ([26ec763](https://github.com/thesoftwarebakery/dastardly/commit/26ec7638e0a2f4657b4cc321f5b5662db6ac1fd0))
* **csv:** implement CSV serializer with comprehensive test coverage ([12240ec](https://github.com/thesoftwarebakery/dastardly/commit/12240ecd77307826a9c53b38b1a723ca63ce3608))
* **csv:** improve serializer with comprehensive edge case handling ([fc405cf](https://github.com/thesoftwarebakery/dastardly/commit/fc405cfffd4653bd3888cd95def72a3c27eaa31f))
* **csv:** update grammar for external scanner integration ([117c2b0](https://github.com/thesoftwarebakery/dastardly/commit/117c2b0c0894635446e07cf86d798f2b3b53d8d6))
* **integration-tests:** add comprehensive CSV integration tests ([7ee3541](https://github.com/thesoftwarebakery/dastardly/commit/7ee3541454fd3d1c69b5ed4f43c5bc2fc3cb395f))
* **json:** add JSON parser, serializer, and utils with tests ([a7f49bc](https://github.com/thesoftwarebakery/dastardly/commit/a7f49bc6d63263ea80b2a84c0fb51fd1efaa3fa4))
* **json:** convert parser from recursive to iterative algorithm ([2fdb199](https://github.com/thesoftwarebakery/dastardly/commit/2fdb199115f16a6804ed1588744f7424170d100c))
* **tree-sitter-csv:** fork tree-sitter-csv with prebuilt binary support ([a564c9a](https://github.com/thesoftwarebakery/dastardly/commit/a564c9a4e25c96baddc219a11fc89260d863258f))
* **tree-sitter-runtime:** add incremental parsing foundation ([e57819d](https://github.com/thesoftwarebakery/dastardly/commit/e57819dc72de567c4f1cb25f8df056ec097defe0))
* **tree-sitter-runtime:** add tree-sitter runtime abstraction package ([acbdd51](https://github.com/thesoftwarebakery/dastardly/commit/acbdd5157e2a913cdd918d2111453f737891c8b8))
* **validation:** add $ref support for local schema references ([8fc5c91](https://github.com/thesoftwarebakery/dastardly/commit/8fc5c91189f9a6ae88a5799acadbf3dddfb1d524))
* **validation:** add combinator validators (allOf, anyOf, oneOf, not) ([c92d4f4](https://github.com/thesoftwarebakery/dastardly/commit/c92d4f4e284908396ccafebde8afc83e7bd5073b))
* **validation:** add comprehensive benchmarking suite comparing with AJV ([72d03a5](https://github.com/thesoftwarebakery/dastardly/commit/72d03a5d6427b646b78402766447c664c1b4aad4))
* **validation:** add conditional, contains, uniqueItems, and dependencies validators ([8fc98f6](https://github.com/thesoftwarebakery/dastardly/commit/8fc98f6896a0ddff5569ad8219382a939c8fb06f))
* **validation:** add enum, const, exclusive bounds, and property count validators ([d60a28b](https://github.com/thesoftwarebakery/dastardly/commit/d60a28b44afb47199ac4543ce4113dd87dd243b1))
* **validation:** add format and propertyNames validation support ([50d0fcf](https://github.com/thesoftwarebakery/dastardly/commit/50d0fcfbd0a2b1d5b590ffb386975aef8ec0c22d))
* **validation:** add JSON Schema validator package ([feb0476](https://github.com/thesoftwarebakery/dastardly/commit/feb0476ae361b70a47298a16db7efb67c020dd67))
* **validation:** add nested validation with properties, items, and boolean schemas ([1ab44e3](https://github.com/thesoftwarebakery/dastardly/commit/1ab44e3f2e043c765482c23c25a4c15d05f869ab))
* **validation:** add required object validator ([513665f](https://github.com/thesoftwarebakery/dastardly/commit/513665f5eb27c85d5e2cb834d7fd908e1ee0c243))
* **validation:** add string, number, and array keyword validators ([3060682](https://github.com/thesoftwarebakery/dastardly/commit/3060682c4475074295553715861c882474803461))
* **yaml:** add package structure and comprehensive utils tests (TDD) ([2d01c22](https://github.com/thesoftwarebakery/dastardly/commit/2d01c22470caf0e6c6c6750ef6a05bd67870914e))
* **yaml:** implement all utility functions (TDD green phase) ([583a54b](https://github.com/thesoftwarebakery/dastardly/commit/583a54bd50c988e02ab9c672dbc9b148f8196092))
* **yaml:** implement YAML parser with comprehensive test coverage ([46cf4e0](https://github.com/thesoftwarebakery/dastardly/commit/46cf4e01c5fc79661d5a8fa314289a60f866440e))
* **yaml:** implement YAML serializer with comprehensive test coverage ([e3a31ed](https://github.com/thesoftwarebakery/dastardly/commit/e3a31ed5e059cbcad795b0ee0029e979156df18c))


### BREAKING CHANGES

* FormatPackage interface now accepts optional parse options

Core Changes:
- Add BaseParseOptions interface for format-agnostic parse options
- Update FormatPackage<TSerializeOptions, TParseOptions> to accept both type parameters
- Add optional parse options to parse() and parseValue() methods
- TParseOptions defaults to BaseParseOptions for backward compatibility

Package Updates:
- JSON: Accept but ignore BaseParseOptions (no parse-time configuration needed)
- YAML: Accept but ignore BaseParseOptions (no parse-time configuration needed)
- CSV: Implement CSVParseOptions extending BaseParseOptions
  - inferTypes: boolean - parse "42" as number vs string
  - delimiter: string - CSV/TSV/PSV selection
  - headers: boolean | string[] - header handling

CSV Implementation:
- csv.parse() now accepts options and properly uses them
- Automatic grammar selection based on delimiter option
- Added 11 comprehensive unit tests for parse options
- All CSV unit tests passing (141 passed, 1 skipped)

Integration Test Results:
- Fixed 14 of 17 failing integration tests (82% improvement)
- Reduced failures from 17 to 3 by implementing parse options
- Remaining 3 failures are pre-existing unrelated issues

This resolves the fundamental mismatch where CSV needs parse-time
configuration (type inference, delimiter selection) but the FormatPackage
interface didn't support it.
* Changed all AST node definitions from interface inheritance
to type aliases to enable proper TypeScript discriminated union narrowing.

Previous pattern using `interface StringNode extends ASTNode` created
structural subtype relationships that prevented TypeScript's control flow
analysis from narrowing types correctly. The new pattern uses independent
type aliases combined into a union type, following TypeScript best practices.

See: https://github.com/microsoft/TypeScript/issues/56106

Changes:
- Convert all node interfaces to type aliases
- Move ASTNode from base interface to union type
- Add loc property directly to each node type
- Add documentation explaining the pattern

All tests pass and type narrowing now works correctly in callbacks.
* Complete rewrite of core AST implementation

- Separate types, builders, guards, traverse, and utils into modules
- Use immutable interfaces with readonly fields
- Implement visitor pattern with discriminated unions for type safety
- Add Position type with line, column, and offset tracking
- Remove format-specific metadata (keep core pure)
- Add comprehensive traversal utilities (findAll, findFirst, getChildren)
- Export clean public API through index.ts

This replaces the previous broken implementation with a type-safe,
format-agnostic foundation for the dastardly parser/serializer.

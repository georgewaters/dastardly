# @dastardly/csv

High-performance CSV/TSV/PSV parser and serializer for dASTardly, built with Tree-sitter.

## Installation

```bash
npm install @dastardly/csv
```

```bash
pnpm add @dastardly/csv
```

## Overview

`@dastardly/csv` provides a blazing-fast CSV parser and serializer that converts CSV to dASTardly's format-agnostic AST. Built on tree-sitter for real-time editor performance with full position tracking for precise error reporting.

**Key Features:**
- **High performance** - Tree-sitter-based parsing for real-time editor feedback
- **Multiple delimiters** - Support for CSV (`,`), TSV (`\t`), and PSV (`|`)
- **Position tracking** - Every node tracks source location (line, column, offset)
- **Flexible headers** - Auto-detect, custom headers, or no headers mode
- **Type inference** - Optional automatic type detection for numbers and booleans
- **Quote strategies** - Configurable quoting: needed, all, nonnumeric, or none
- **Type-safe** - Full TypeScript support with strict mode
- **Format-agnostic AST** - Convert to/from other formats (JSON, YAML, etc.)

## Quick Start

### Parsing

```typescript
import { parse, parseValue } from '@dastardly/csv';

// Parse CSV with headers to DocumentNode
const doc = parse('name,age\nAlice,30\nBob,25');
console.log(doc.body.type); // 'Array'
console.log(doc.body.elements[0].type); // 'Object'

// Parse to DataNode (just the value)
const data = parseValue('name,age\nAlice,30\nBob,25');
console.log(data.type); // 'Array'
console.log(data.elements.length); // 2
```

### Serializing

```typescript
import { serialize } from '@dastardly/csv';

// Serialize with default options (comma delimiter, auto-headers)
const csv = serialize(ast);
// name,age
// Alice,30
// Bob,25

// Serialize as TSV (tab-separated)
const tsv = serialize(ast, { delimiter: '\t' });
// name	age
// Alice	30
// Bob	25

// Serialize with all fields quoted
const quoted = serialize(ast, { quoting: 'all' });
// "name","age"
// "Alice","30"
// "Bob","25"
```

### Roundtrip

```typescript
import { parse, serialize } from '@dastardly/csv';

const source = 'name,age\nAlice,30\nBob,25';
const ast = parse(source);
const output = serialize(ast);
// Preserves data structure, can reformat with different options
```

## API Reference

### Convenience Functions

#### `parse(source)`

Parse CSV string into a DocumentNode:

```typescript
function parse(source: string): DocumentNode;
```

**Example:**

```typescript
import { parse } from '@dastardly/csv';

const doc = parse('name,age\nAlice,30');
console.log(doc.type); // 'Document'
console.log(doc.body.type); // 'Array'
```

**Throws:** `ParseError` if source is invalid CSV

#### `parseValue(source)`

Parse CSV string and return just the body (DataNode):

```typescript
function parseValue(source: string): DataNode;
```

**Example:**

```typescript
import { parseValue } from '@dastardly/csv';

const data = parseValue('name,age\nAlice,30');
console.log(data.type); // 'Array'
// No need to access .body
```

**Throws:** `ParseError` if source is invalid CSV

#### `serialize(node, options?)`

Serialize AST to CSV string:

```typescript
function serialize(
  node: DocumentNode | DataNode,
  options?: CSVSerializeOptions
): string;
```

**Parameters:**
- `node` - DocumentNode or DataNode to serialize (must be an Array of Objects or Array of Arrays)
- `options` - Optional CSV serialization options

**Example:**

```typescript
import { serialize } from '@dastardly/csv';

// Default (comma delimiter, auto headers)
serialize(ast);
// name,age
// Alice,30

// TSV with CRLF line endings
serialize(ast, { delimiter: '\t', lineEnding: 'crlf' });

// Custom headers
serialize(ast, { headers: ['Name', 'Age'] });
```

### Classes

#### `CSVParser`

Reusable CSV parser instance with configurable options:

```typescript
class CSVParser extends TreeSitterParser {
  constructor(
    runtime: ParserRuntime,
    languageWrapper: LanguageWrapper,
    options?: CSVParseOptions
  );
  parse(source: string): DocumentNode;
}
```

**Parse Options:**

```typescript
interface CSVParseOptions {
  headers?: boolean | string[];  // Default: true
  delimiter?: ',' | '\t' | '|' | string;  // Default: ','
  inferTypes?: boolean;  // Default: false
}
```

- `headers`:
  - `true` (default): Auto-detect headers from first row, produce array-of-objects
  - `false`: No headers, produce array-of-arrays
  - `string[]`: Use provided header names, produce array-of-objects
- `delimiter`: Field separator (`,` for CSV, `\t` for TSV, `|` for PSV)
- `inferTypes`: Automatically convert numbers and booleans from strings

**Example:**

```typescript
import { CSVParser } from '@dastardly/csv';
import { NodeTreeSitterRuntime } from '@dastardly/tree-sitter-runtime';
import CSV_LANGUAGE from '@dastardly/tree-sitter-csv';

const runtime = new NodeTreeSitterRuntime();

// CSV with type inference
const csvParser = new CSVParser(runtime, CSV_LANGUAGE.csv, {
  headers: true,
  inferTypes: true
});

const doc1 = csvParser.parse('name,age\nAlice,30\nBob,25');
// Result: [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
// Note: ages are numbers, not strings

// TSV without headers (array-of-arrays)
const tsvParser = new CSVParser(runtime, CSV_LANGUAGE.tsv, {
  headers: false,
  delimiter: '\t'
});

const doc2 = tsvParser.parse('Alice\t30\nBob\t25');
// Result: [['Alice', '30'], ['Bob', '25']]
```

#### `serialize(node, options)`

Advanced serialization with full options:

```typescript
interface CSVSerializeOptions {
  delimiter?: ',' | '\t' | '|' | string;  // Default: ','
  quoting?: 'needed' | 'all' | 'nonnumeric' | 'none';  // Default: 'needed'
  lineEnding?: 'lf' | 'crlf';  // Default: 'lf'
  headers?: boolean | string[];  // Default: true
  nestHandling?: 'error' | 'json' | 'flatten';  // Default: 'error'
}

function serialize(
  node: DocumentNode | DataNode,
  options?: CSVSerializeOptions
): string;
```

**Options:**

- `delimiter`: Field separator
  - `','` (default): Comma-separated (CSV)
  - `'\t'`: Tab-separated (TSV)
  - `'|'`: Pipe-separated (PSV)
  - Custom string

- `quoting`: When to quote fields
  - `'needed'` (default): Quote only when necessary (contains delimiter, quotes, or newlines)
  - `'all'`: Quote all fields
  - `'nonnumeric'`: Quote all non-numeric fields
  - `'none'`: Never quote (unsafe if data contains special characters)

- `lineEnding`: Line terminator
  - `'lf'` (default): Unix-style (`\n`)
  - `'crlf'`: Windows-style (`\r\n`)

- `headers`: Header row handling
  - `true` (default): Auto-generate from object keys (for array-of-objects)
  - `false`: No headers
  - `string[]`: Use provided headers

- `nestHandling`: How to handle nested objects/arrays
  - `'error'` (default): Throw error on nested structures
  - `'json'`: JSON.stringify nested structures
  - `'flatten'`: Flatten nested objects with dot notation (e.g., `address.city`)

**Example:**

```typescript
import { serialize } from '@dastardly/csv';

// TSV with all fields quoted and CRLF
const tsv = serialize(ast, {
  delimiter: '\t',
  quoting: 'all',
  lineEnding: 'crlf'
});
// "name"	"age"
// "Alice"	"30"
// "Bob"	"25"

// PSV with only non-numeric values quoted
const psv = serialize(ast, {
  delimiter: '|',
  quoting: 'nonnumeric'
});
// "name"|"age"
// "Alice"|30
// "Bob"|25

// Nested objects with JSON stringification
const csv = serialize(nestedAst, {
  nestHandling: 'json'
});
// name,address
// Alice,"{""city"":""NYC""}"

// Flattened nested objects
const flattened = serialize(nestedAst, {
  nestHandling: 'flatten'
});
// name,address.city,address.zip
// Alice,NYC,10001
```

### Utilities

#### `escapeField(value, delimiter)`

Escape a field value for CSV output:

```typescript
function escapeField(value: string, delimiter: string): string;
```

**Example:**

```typescript
import { escapeField } from '@dastardly/csv';

escapeField('Hello, world', ',');  // '"Hello, world"'
escapeField('She said "hi"', ','); // '"She said ""hi"""'
escapeField('Simple', ',');        // 'Simple'
```

#### `unescapeField(value)`

Unescape a CSV field value:

```typescript
function unescapeField(value: string): string;
```

**Example:**

```typescript
import { unescapeField } from '@dastardly/csv';

unescapeField('"Hello, world"');      // 'Hello, world'
unescapeField('"She said ""hi"""');   // 'She said "hi"'
unescapeField('Simple');              // 'Simple'
```

#### `needsQuoting(value, delimiter, strategy)`

Determine if a field needs quoting:

```typescript
function needsQuoting(
  value: string,
  delimiter: string,
  quoting: QuoteStrategy
): boolean;
```

**Example:**

```typescript
import { needsQuoting } from '@dastardly/csv';

needsQuoting('simple', ',', 'needed');     // false
needsQuoting('Hello, world', ',', 'needed'); // true
needsQuoting('123', ',', 'nonnumeric');    // false
needsQuoting('text', ',', 'nonnumeric');   // true
needsQuoting('anything', ',', 'all');      // true
needsQuoting('anything', ',', 'none');     // false
```

#### `parseCSVNumber(text)`

Parse a number from CSV text:

```typescript
function parseCSVNumber(text: string): number;
```

**Example:**

```typescript
import { parseCSVNumber } from '@dastardly/csv';

parseCSVNumber('42');      // 42
parseCSVNumber('3.14');    // 3.14
parseCSVNumber('-10');     // -10
parseCSVNumber('1.5e2');   // 150
```

#### `normalizeLineEnding(text, style)`

Normalize line endings in text:

```typescript
function normalizeLineEnding(text: string, style: 'crlf' | 'lf'): string;
```

**Example:**

```typescript
import { normalizeLineEnding } from '@dastardly/csv';

normalizeLineEnding('a\nb\nc', 'crlf');     // 'a\r\nb\r\nc'
normalizeLineEnding('a\r\nb\r\nc', 'lf');   // 'a\nb\nc'
```

## Examples

### Basic Parsing

```typescript
import { parseValue } from '@dastardly/csv';

// Parse CSV with headers (default)
const data = parseValue('name,age\nAlice,30\nBob,25');
console.log(data.type); // 'Array'
console.log(data.elements[0].type); // 'Object'
console.log(data.elements[0].properties[0].key.value); // 'name'
console.log(data.elements[0].properties[0].value.value); // 'Alice'
```

### Parsing Without Headers

```typescript
import { CSVParser } from '@dastardly/csv';
import { NodeTreeSitterRuntime } from '@dastardly/tree-sitter-runtime';
import CSV_LANGUAGE from '@dastardly/tree-sitter-csv';

const runtime = new NodeTreeSitterRuntime();
const parser = new CSVParser(runtime, CSV_LANGUAGE.csv, {
  headers: false
});

const doc = parser.parse('Alice,30\nBob,25');
// Result: [['Alice', '30'], ['Bob', '25']]
console.log(doc.body.elements[0].type); // 'Array'
console.log(doc.body.elements[0].elements[0].value); // 'Alice'
```

### Type Inference

```typescript
import { CSVParser } from '@dastardly/csv';
import { NodeTreeSitterRuntime } from '@dastardly/tree-sitter-runtime';
import CSV_LANGUAGE from '@dastardly/tree-sitter-csv';

const runtime = new NodeTreeSitterRuntime();
const parser = new CSVParser(runtime, CSV_LANGUAGE.csv, {
  headers: true,
  inferTypes: true
});

const doc = parser.parse('name,age,active\nAlice,30,true\nBob,25,false');
// Types are automatically inferred:
// [
//   { name: 'Alice', age: 30, active: true },
//   { name: 'Bob', age: 25, active: false }
// ]

const firstPerson = doc.body.elements[0];
console.log(firstPerson.properties[1].value.type); // 'Number' (not 'String')
console.log(firstPerson.properties[2].value.type); // 'Boolean' (not 'String')
```

### Position Tracking

```typescript
import { parse } from '@dastardly/csv';

const source = 'name,age\nAlice,30';
const doc = parse(source);

// Access position information
const array = doc.body;
console.log(array.loc.start.line); // 1
console.log(array.loc.start.column); // 0

// First object position
const obj = array.elements[0];
console.log(obj.loc.start.line); // 2
console.log(obj.loc.start.column); // 0
```

### Handling Quoted Fields

```typescript
import { parse } from '@dastardly/csv';

// Quoted fields with commas
const data1 = parse('text\n"Hello, world"');
console.log(data1.body.elements[0].properties[0].value.value); // 'Hello, world'

// Escaped quotes
const data2 = parse('text\n"She said ""hello"""');
console.log(data2.body.elements[0].properties[0].value.value); // 'She said "hello"'

// Multiline quoted fields
const data3 = parse('text\n"Line 1\nLine 2"');
console.log(data3.body.elements[0].properties[0].value.value); // 'Line 1\nLine 2'
```

### TSV (Tab-Separated Values)

```typescript
import { CSVParser, serialize } from '@dastardly/csv';
import { NodeTreeSitterRuntime } from '@dastardly/tree-sitter-runtime';
import CSV_LANGUAGE from '@dastardly/tree-sitter-csv';

const runtime = new NodeTreeSitterRuntime();
const parser = new CSVParser(runtime, CSV_LANGUAGE.tsv, {
  delimiter: '\t'
});

// Parse TSV
const doc = parser.parse('name\tage\nAlice\t30\nBob\t25');

// Serialize as TSV
const tsv = serialize(doc.body, { delimiter: '\t' });
console.log(tsv);
// name	age
// Alice	30
// Bob	25
```

### PSV (Pipe-Separated Values)

```typescript
import { CSVParser, serialize } from '@dastardly/csv';
import { NodeTreeSitterRuntime } from '@dastardly/tree-sitter-runtime';
import CSV_LANGUAGE from '@dastardly/tree-sitter-csv';

const runtime = new NodeTreeSitterRuntime();
const parser = new CSVParser(runtime, CSV_LANGUAGE.psv, {
  delimiter: '|'
});

// Parse PSV
const doc = parser.parse('name|age\nAlice|30\nBob|25');

// Serialize as PSV
const psv = serialize(doc.body, { delimiter: '|' });
console.log(psv);
// name|age
// Alice|30
// Bob|25
```

### Custom Serialization

```typescript
import { serialize, parseValue } from '@dastardly/csv';

const ast = parseValue('name,age\nAlice,30\nBob,25');

// Quote all fields
const allQuoted = serialize(ast, { quoting: 'all' });
// "name","age"
// "Alice","30"
// "Bob","25"

// Quote only non-numeric
const nonNumQuoted = serialize(ast, { quoting: 'nonnumeric' });
// "name","age"
// "Alice",30
// "Bob",25

// Windows line endings
const windows = serialize(ast, { lineEnding: 'crlf' });
// name,age\r\n
// Alice,30\r\n
// Bob,25
```

### Handling Nested Data

```typescript
import { serialize, objectNode, propertyNode, stringNode, arrayNode } from '@dastardly/csv';

const nestedData = arrayNode([
  objectNode([
    propertyNode(stringNode('name'), stringNode('Alice')),
    propertyNode(stringNode('address'), objectNode([
      propertyNode(stringNode('city'), stringNode('NYC')),
      propertyNode(stringNode('zip'), stringNode('10001'))
    ]))
  ])
]);

// Option 1: JSON stringify nested structures
const jsonified = serialize(nestedData, { nestHandling: 'json' });
// name,address
// Alice,"{""city"":""NYC"",""zip"":""10001""}"

// Option 2: Flatten nested objects with dot notation
const flattened = serialize(nestedData, { nestHandling: 'flatten' });
// name,address.city,address.zip
// Alice,NYC,10001

// Option 3: Error on nesting (default)
try {
  serialize(nestedData); // Throws error
} catch (e) {
  console.error('Cannot serialize nested object');
}
```

### Converting to Native Values

```typescript
import { parseValue } from '@dastardly/csv';
import { toNative } from '@dastardly/core';

const ast = parseValue('name,age\nAlice,30\nBob,25');
const data = toNative(ast);

console.log(data[0].name); // 'Alice'
console.log(data[0].age); // '30' (string unless inferTypes was used)
console.log(data[1].name); // 'Bob'
```

## Known Limitations

### Empty Fields Not Supported

The tree-sitter-csv grammar does not currently support empty fields:

```typescript
// This will fail with a parse error
parse('a,b,c\n1,,3'); // Error: empty field in middle
```

**Workaround**: Use explicit empty strings:
```typescript
parse('a,b,c\n1,"",3'); // Works
```

See `LIMITATIONS.md` for details and proposed fixes.

### Single-Character Text Fields Not Supported

The grammar requires text fields to have at least 2 characters:

```typescript
// This will fail
parse('a\n1\n2'); // Error: 'a' is single character

// These work (numbers, not text)
parse('1\n2\n3'); // OK

// This works (quoted)
parse('"a"\n"1"\n"2"'); // OK
```

**Workaround**: Quote single-character fields or use longer names.

See `LIMITATIONS.md` for details and proposed fixes.

### Variable Field Counts Not Supported

All rows must have the same number of fields:

```typescript
// This will fail
parse('a,b\n1,2,3'); // Error: row 2 has more fields than header
```

**Workaround**: Ensure all rows have consistent field counts.

See `LIMITATIONS.md` for details.

## Cross-Format Conversion

The AST can be converted to other formats:

```typescript
import { parseValue as parseCSV } from '@dastardly/csv';
import { serialize as toJSON } from '@dastardly/json';

const ast = parseCSV('name,age\nAlice,30\nBob,25');
const json = toJSON(ast, { indent: 2 });
// [
//   {
//     "name": "Alice",
//     "age": "30"
//   },
//   {
//     "name": "Bob",
//     "age": "25"
//   }
// ]
```

## Related Packages

- **[@dastardly/core](https://www.npmjs.com/package/@dastardly/core)** - Core AST types and utilities
- **[@dastardly/tree-sitter-runtime](https://www.npmjs.com/package/@dastardly/tree-sitter-runtime)** - Tree-sitter runtime abstraction
- **[@dastardly/tree-sitter-csv](https://www.npmjs.com/package/@dastardly/tree-sitter-csv)** - Tree-sitter CSV/TSV/PSV grammar
- **[@dastardly/json](https://www.npmjs.com/package/@dastardly/json)** - JSON parser and serializer
- **[@dastardly/yaml](https://www.npmjs.com/package/@dastardly/yaml)** - YAML parser and serializer

## Testing

This package has comprehensive test coverage:
- **95 tests passing** covering all functionality
- **4 tests skipped** for documented grammar limitations
- **Parser tests**: 19 tests (2 skipped)
- **Serializer tests**: 27 tests
- **Integration tests**: 17 tests (2 skipped)
- **Utility tests**: 34 tests

Run tests:

```bash
pnpm test
```

## License

MIT

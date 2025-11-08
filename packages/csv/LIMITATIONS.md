# Known Limitations of CSV Parser

This document tracks known limitations of the CSV parser that should be addressed in future improvements.

## ~~Single-Character Text Fields Not Supported~~ ✅ FIXED

**Status**: **RESOLVED** - Single-character text fields are now fully supported.

**Previous Issue**: The parser could not parse single-character unquoted text fields (e.g., `a\n1\n2` where 'a' is a single letter).

**Root Cause**: The original grammar regex required at least 2 characters: `[^${separator}\\d\\s"][^${separator} \\n\\r"]+` (the `+` quantifier requires 1 or more characters after the first).

**Fix Applied**: Modified the regex in `common/define-grammar.js` to allow zero or more characters after the first:
```javascript
text: _ => token(choice(
  new RegExp(`[^${separator}\\d\\s"][^${separator}\\s"]*`),  // * means "0 or more"
  seq('"', repeat(choice(/[^"]/, '""')), '"'),
)),
```

This change also unified whitespace handling using `\s` instead of listing individual whitespace characters.

**Test Results**: All previously skipped tests now pass. Single-character headers like `a,b,c` and single-letter values are fully supported.

## ~~Empty Fields Not Supported~~ ✅ FIXED

**Status**: **RESOLVED** - Empty fields are now fully supported via external scanner.

**Previous Issue**: The parser could not support empty fields (e.g., `a,b,c\n1,,3`) because tree-sitter fundamentally prohibits grammar rules that match empty strings.

**Root Cause**: Tree-sitter's grammar DSL cannot express empty-string matches, as this would cause infinite loops in the parser. The naive approach of `optional(choice(...))` is explicitly rejected.

**Solution Implemented**: External scanner in C (`packages/tree-sitter-csv/src/scanner.c`) that detects empty fields by examining lookahead:
- Consecutive separators (`,,`) - middle empty field
- Separator before newline (`,\n`) - trailing empty field
- Newline after separator from previous row - leading empty field
- Zero-width tokens via `mark_end()` before advancing

**Technical Details**:
- External scanner exports functions for all three variants (CSV, TSV, PSV)
- Stateless design (no state to serialize/deserialize)
- Grammar updated to use single separators between fields instead of `repeat(separator)`
- Document grammar handles trailing newlines correctly

**Test Results**: All tests passing (98/99, with 1 intentionally skipped for variable field counts)

## Variable Field Counts Not Supported

**Issue**: The grammar requires all rows to have the same number of fields. Rows with fewer or more fields than the header row cause parse errors.

**Root Cause**: The tree-sitter-csv grammar structure doesn't handle variable-length rows gracefully.

**Impact**:
- Real-world CSV files with inconsistent field counts will fail to parse
- Missing fields at end of row cannot be auto-filled with empty values
- Extra fields in a row cause parse errors
- See skipped test: `__tests__/parser.test.ts` - "should handle rows with different field counts"

**Workaround**: Ensure all rows have exactly the same number of fields as the header row.

## Future Work

### High Priority
1. **Empty field support** - Required for RFC 4180 compliance
   - Modify grammar in `@dastardly/tree-sitter-csv`
   - Regenerate parser.c files
   - Update parser to handle empty field nodes
   - Un-skip and verify test passes

### Medium Priority
2. **Variable field count support** - Improve robustness for real-world CSV files
   - Investigate grammar changes needed
   - Decide on behavior: error, warning, or auto-fill?
   - Implement parser logic to pad missing fields

### Low Priority
3. **Set up tree-sitter-cli workflow** - Enable grammar development
   - Document tree-sitter-cli installation for developers
   - Consider development container with pre-installed tools
   - Add grammar regeneration to CI/CD pipeline

## RFC 4180 Compliance Status

| Feature | Status | Notes |
|---------|--------|-------|
| Comma delimiter | ✅ | Supported |
| Optional header row | ✅ | Configurable via `headers` option |
| CRLF line endings | ✅ | Supported (fixed in Phase 1) |
| LF line endings | ✅ | Supported |
| Single-character text fields | ✅ | Supported (fixed in Phase 1) |
| Quoted fields | ✅ | Supported |
| Escaped quotes (`""`) | ✅ | Supported |
| Embedded newlines in quotes | ❓ | Untested |
| Empty fields | ✅ | **Supported** - external scanner (Phase 2) |
| Leading/trailing spaces | ✅ | Preserved in unquoted fields |

## For Developers

When fixing grammar limitations:

1. **Modify grammar**: Edit `packages/tree-sitter-csv/common/define-grammar.js`
2. **Regenerate parsers**: `cd packages/tree-sitter-csv && npm run generate`
   - Uses system tree-sitter CLI (development dependency only)
   - Generates `parser.c` files for csv/psv/tsv variants
3. **Fix node-types.json format** (tree-sitter CLI 0.25+ compatibility):
   ```bash
   for dir in csv psv tsv; do
     cd packages/tree-sitter-csv/$dir/src
     node -e "const data = require('./node-types.json'); const fs = require('fs'); \
              fs.writeFileSync('./node-types.json', JSON.stringify(data.Ok || data, null, 2));"
   done
   ```
   This unwraps the `{"Ok": [...]}` wrapper for compatibility with runtime 0.21.1.
4. **Rebuild native bindings**: `cd packages/tree-sitter-csv && pnpm rebuild`
5. **Run tests**: `pnpm --filter @dastardly/csv test`
6. **Update parser logic** if needed to handle new node types
7. **Un-skip relevant tests** and verify they pass
8. **Commit everything**: Regenerated `parser.c`, `node-types.json`, and grammar changes
9. **Update documentation**: This LIMITATIONS.md file and ARCHITECTURE.md

**Note**: Consumers don't need tree-sitter CLI installed. The committed `parser.c` files are used during `npm install`.

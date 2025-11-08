# Known Limitations of CSV Parser

This document tracks known limitations of the CSV parser that should be addressed in future improvements.

## Single-Character Text Fields Not Supported

**Issue**: The parser cannot parse single-character unquoted text fields (e.g., `a\n1\n2` where 'a' is a single letter).

**Root Cause**: The underlying tree-sitter-csv grammar in `@dastardly/tree-sitter-csv` requires text fields to have at least 2 characters. In `common/define-grammar.js`, the `text` rule is:
```javascript
text: _ => token(choice(
  new RegExp(`[^${separator}\\d\\s"][^${separator} \\n\\r"]+`),  // + means "1 or more"
  seq('"', repeat(choice(/[^"]/, '""')), '"'),
)),
```

The `+` quantifier in the regex requires at least one character after the first character, making single-character fields invalid.

**Proposed Fix**: Change the `+` quantifier to `*` (zero or more) in the grammar:
```javascript
text: _ => token(choice(
  new RegExp(`[^${separator}\\d\\s"][^${separator} \\n\\r"]*`),  // * means "0 or more"
  seq('"', repeat(choice(/[^"]/, '""')), '"'),
)),
```

**Blocked By**: Need to set up tree-sitter-cli development workflow for regenerating parsers from the modified grammar.

**Impact**:
- Single-character column headers fail to parse (e.g., `a,b,c`)
- Single-letter values in data rows fail to parse (e.g., `name\nA`)
- Single-digit numbers work (they match the `number` rule instead)
- Quoted single characters work (e.g., `"a"`)
- This violates common CSV usage patterns with short column names
- See skipped tests: `__tests__/integration.test.ts` - "supports CRLF line endings", "can be instantiated and reused"

**Workaround**: Quote all single-character text fields (e.g., `"a"\n"1"\n"2"`) or ensure all text fields have at least 2 characters.

## Empty Fields Not Supported

**Issue**: The parser currently does not support empty fields (e.g., `a,b,c\n1,,3` where the second field is empty).

**Root Cause**: The underlying tree-sitter-csv grammar in `@dastardly/tree-sitter-csv` requires field content. In `common/define-grammar.js`, the `field` rule is:
```javascript
field: $ => choice($.text, $.number, $.float, $.boolean),
```

**Proposed Fix**: Make field content optional in the grammar:
```javascript
field: $ => optional(choice($.text, $.number, $.float, $.boolean)),
```

**Blocked By**: Need to set up tree-sitter-cli development workflow for regenerating parsers from the modified grammar.

**Impact**:
- CSV files with empty fields will fail to parse with "syntax error"
- This violates RFC 4180 CSV specification which allows empty fields
- See skipped test: `__tests__/parser.test.ts` - "should handle empty fields"

**Workaround**: Ensure all CSV files have content in every field (use explicit empty strings `""` if needed).

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
| CRLF line endings | ✅ | Supported |
| LF line endings | ✅ | Supported |
| Quoted fields | ✅ | Supported |
| Escaped quotes (`""`) | ✅ | Supported |
| Embedded newlines in quotes | ❓ | Untested |
| Empty fields | ❌ | **Not supported** - grammar limitation |
| Leading/trailing spaces | ✅ | Preserved in unquoted fields |

## For Developers

When fixing grammar limitations:

1. Modify `packages/tree-sitter-csv/common/define-grammar.js`
2. Run `tree-sitter generate --no-bindings` in each grammar directory
3. Rebuild native binding: `cd packages/tree-sitter-csv && pnpm install`
4. Update parser logic if needed to handle new node types
5. Un-skip relevant tests and verify they pass
6. Commit regenerated `parser.c` files with grammar changes
7. Update this LIMITATIONS.md file

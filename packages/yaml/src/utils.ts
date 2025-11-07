// YAML utility functions

/**
 * Escape a string for YAML double-quoted scalar.
 * Handles all YAML escape sequences.
 */
export function escapeDoubleQuoteString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')  // Backslash (must be first)
    .replace(/"/g, '\\"')    // Double quote
    .replace(/\n/g, '\\n')   // Newline
    .replace(/\r/g, '\\r')   // Carriage return
    .replace(/\t/g, '\\t')   // Tab
    .replace(/\x08/g, '\\b') // Backspace
    .replace(/\f/g, '\\f')   // Form feed
    .replace(/\0/g, '\\0')   // Null
    .replace(/\x07/g, '\\a') // Bell
    .replace(/\x0b/g, '\\v') // Vertical tab
    .replace(/\x1b/g, '\\e'); // Escape character
}

/**
 * Unescape a YAML double-quoted string.
 * Handles all YAML escape sequences including \xXX, \uXXXX, \UXXXXXXXX.
 */
export function unescapeDoubleQuoteString(value: string): string {
  let result = '';
  let i = 0;

  while (i < value.length) {
    if (value[i] === '\\' && i + 1 < value.length) {
      const next = value[i + 1];

      // Handle hex escapes \xXX (2 digits)
      if (next === 'x' && i + 3 < value.length) {
        const hex = value.substring(i + 2, i + 4);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16));
          i += 4;
          continue;
        }
      }

      // Handle unicode escapes \uXXXX (4 digits)
      if (next === 'u' && i + 5 < value.length) {
        const hex = value.substring(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
      }

      // Handle unicode escapes \UXXXXXXXX (8 digits)
      if (next === 'U' && i + 9 < value.length) {
        const hex = value.substring(i + 2, i + 10);
        if (/^[0-9a-fA-F]{8}$/.test(hex)) {
          const codePoint = parseInt(hex, 16);
          result += String.fromCodePoint(codePoint);
          i += 10;
          continue;
        }
      }

      // Handle single-character escapes
      switch (next) {
        case '\\': result += '\\'; i += 2; break;
        case '"': result += '"'; i += 2; break;
        case 'n': result += '\n'; i += 2; break;
        case 'r': result += '\r'; i += 2; break;
        case 't': result += '\t'; i += 2; break;
        case 'b': result += '\b'; i += 2; break;
        case 'f': result += '\f'; i += 2; break;
        case '0': result += '\0'; i += 2; break;
        case 'a': result += '\x07'; i += 2; break;
        case 'v': result += '\x0b'; i += 2; break;
        case 'e': result += '\x1b'; i += 2; break;
        case ' ': result += ' '; i += 2; break;
        case '/': result += '/'; i += 2; break;
        default:
          // Unknown escape - preserve as-is
          result += value[i];
          i++;
          break;
      }
    } else {
      result += value[i];
      i++;
    }
  }

  return result;
}

/**
 * Escape a string for YAML single-quoted scalar.
 * Only escapes single quotes by doubling them.
 */
export function escapeSingleQuoteString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Unescape a YAML single-quoted string.
 * Converts doubled single quotes to single quotes.
 */
export function unescapeSingleQuoteString(value: string): string {
  return value.replace(/''/g, "'");
}

/**
 * Parse a YAML number from text.
 * Handles: decimal, hex (0xFF), octal (0o77), binary (0b1010),
 * exponential, and special float values (.inf, -.inf, .nan)
 */
export function parseYAMLNumber(text: string): number {
  const lower = text.toLowerCase();

  // Handle special float values
  if (lower === '.inf' || lower === '+.inf') return Infinity;
  if (lower === '-.inf') return -Infinity;
  if (lower === '.nan') return NaN;

  // Handle hexadecimal (0xFF, 0XFF)
  if (/^0x/i.test(text)) {
    return parseInt(text, 16);
  }

  // Handle octal (0o77, 0O77)
  if (/^0o/i.test(text)) {
    return parseInt(text.slice(2), 8);
  }

  // Handle binary (0b1010, 0B1010)
  if (/^0b/i.test(text)) {
    return parseInt(text.slice(2), 2);
  }

  // Handle decimal and exponential notation
  return parseFloat(text);
}

/**
 * Normalize a boolean value from YAML text.
 * Handles: true/false, yes/no, on/off, y/n (case insensitive)
 */
export function normalizeBoolean(text: string): boolean {
  const lower = text.toLowerCase();

  switch (lower) {
    case 'true':
    case 'yes':
    case 'on':
    case 'y':
      return true;
    case 'false':
    case 'no':
    case 'off':
    case 'n':
      return false;
    default:
      return false; // Default to false for unknown values
  }
}

/**
 * Normalize a null value from YAML text.
 * Handles: null, ~, empty string (case insensitive)
 */
export function normalizeNull(text: string): null {
  // Empty string, null, ~, Null, NULL, etc. all map to null
  return null;
}

/**
 * Check if a string value can be safely used as a plain (unquoted) scalar in YAML.
 * Returns false if the string looks like a boolean, null, number, or contains special YAML characters.
 */
export function isPlainSafe(value: string): boolean {
  // Empty strings must be quoted
  if (value.length === 0) return false;

  // Check for boolean-like values (case insensitive)
  const lower = value.toLowerCase();
  const booleans = ['true', 'false', 'yes', 'no', 'on', 'off', 'y', 'n'];
  if (booleans.includes(lower)) return false;

  // Check for null-like values
  const nulls = ['null', '~'];
  if (nulls.includes(lower) || value === '~') return false;

  // Check if it looks like a number
  if (/^[+-]?\d/.test(value)) {
    // Could be decimal, hex, octal, binary, float, exponential
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(value)) return false;
    if (/^0x[0-9a-fA-F]+$/i.test(value)) return false;
    if (/^0o[0-7]+$/i.test(value)) return false;
    if (/^0b[01]+$/i.test(value)) return false;
  }

  // Check for special float values
  if (/^\.\s*inf$/i.test(value) || /^[+-]\.\s*inf$/i.test(value)) return false;
  if (/^\.\s*nan$/i.test(value)) return false;

  // Check for YAML special characters that require quoting
  const specialChars = [
    ':', // Key-value separator
    '#', // Comment
    '[', ']', // Flow sequence
    '{', '}', // Flow mapping
    ',', // Flow separator
    '&', // Anchor
    '*', // Alias
    '!', // Tag
    '|', // Literal block scalar
    '>', // Folded block scalar
    "'", // Single quote
    '"', // Double quote
    '%', // Directive
    '@', // Reserved
    '`', // Reserved
  ];

  for (const char of specialChars) {
    if (value.includes(char)) return false;
  }

  // Check if starts with special indicators
  if (value[0] === '-' && value[1] === ' ') return false; // Looks like list item
  if (value[0] === '?' && value[1] === ' ') return false; // Looks like complex key

  // Trailing/leading whitespace requires quoting
  if (value !== value.trim()) return false;

  // If all checks pass, it's safe as plain scalar
  return true;
}

/**
 * Normalize indent parameter to a string.
 * undefined or 0 returns empty string.
 * Numbers are converted to that many spaces.
 * Strings are returned as-is.
 */
export function normalizeIndent(indent: number | string | undefined): string {
  if (indent === undefined || indent === 0) return '';
  if (typeof indent === 'number') return ' '.repeat(indent);
  return indent;
}

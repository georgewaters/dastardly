import { describe, it, expect } from 'vitest';
import {
  escapeDoubleQuoteString,
  unescapeDoubleQuoteString,
  escapeSingleQuoteString,
  unescapeSingleQuoteString,
  parseYAMLNumber,
  normalizeBoolean,
  normalizeNull,
  isPlainSafe,
  normalizeIndent,
} from '../src/utils.js';

describe('YAML Utils', () => {
  describe('escapeDoubleQuoteString', () => {
    it('should escape backslash', () => {
      expect(escapeDoubleQuoteString('hello\\world')).toBe('hello\\\\world');
    });

    it('should escape double quote', () => {
      expect(escapeDoubleQuoteString('say "hello"')).toBe('say \\"hello\\"');
    });

    it('should escape newline', () => {
      expect(escapeDoubleQuoteString('line1\nline2')).toBe('line1\\nline2');
    });

    it('should escape tab', () => {
      expect(escapeDoubleQuoteString('hello\tworld')).toBe('hello\\tworld');
    });

    it('should escape carriage return', () => {
      expect(escapeDoubleQuoteString('hello\rworld')).toBe('hello\\rworld');
    });

    it('should escape backspace', () => {
      expect(escapeDoubleQuoteString('hello\bworld')).toBe('hello\\bworld');
    });

    it('should escape form feed', () => {
      expect(escapeDoubleQuoteString('hello\fworld')).toBe('hello\\fworld');
    });

    it('should escape null character', () => {
      expect(escapeDoubleQuoteString('hello\0world')).toBe('hello\\0world');
    });

    it('should escape bell character', () => {
      expect(escapeDoubleQuoteString('hello\x07world')).toBe('hello\\aworld');
    });

    it('should escape vertical tab', () => {
      expect(escapeDoubleQuoteString('hello\x0bworld')).toBe('hello\\vworld');
    });

    it('should escape escape character', () => {
      expect(escapeDoubleQuoteString('hello\x1bworld')).toBe('hello\\eworld');
    });

    it('should not escape regular characters', () => {
      expect(escapeDoubleQuoteString('hello world 123')).toBe('hello world 123');
    });

    it('should handle multiple escapes', () => {
      expect(escapeDoubleQuoteString('line1\nline2\ttab"quote\\')).toBe(
        'line1\\nline2\\ttab\\"quote\\\\'
      );
    });

    it('should handle empty string', () => {
      expect(escapeDoubleQuoteString('')).toBe('');
    });
  });

  describe('unescapeDoubleQuoteString', () => {
    it('should unescape backslash', () => {
      expect(unescapeDoubleQuoteString('hello\\\\world')).toBe('hello\\world');
    });

    it('should unescape double quote', () => {
      expect(unescapeDoubleQuoteString('say \\"hello\\"')).toBe('say "hello"');
    });

    it('should unescape newline', () => {
      expect(unescapeDoubleQuoteString('line1\\nline2')).toBe('line1\nline2');
    });

    it('should unescape tab', () => {
      expect(unescapeDoubleQuoteString('hello\\tworld')).toBe('hello\tworld');
    });

    it('should unescape carriage return', () => {
      expect(unescapeDoubleQuoteString('hello\\rworld')).toBe('hello\rworld');
    });

    it('should unescape backspace', () => {
      expect(unescapeDoubleQuoteString('hello\\bworld')).toBe('hello\bworld');
    });

    it('should unescape form feed', () => {
      expect(unescapeDoubleQuoteString('hello\\fworld')).toBe('hello\fworld');
    });

    it('should unescape null', () => {
      expect(unescapeDoubleQuoteString('hello\\0world')).toBe('hello\0world');
    });

    it('should unescape bell', () => {
      expect(unescapeDoubleQuoteString('hello\\aworld')).toBe('hello\x07world');
    });

    it('should unescape vertical tab', () => {
      expect(unescapeDoubleQuoteString('hello\\vworld')).toBe('hello\x0bworld');
    });

    it('should unescape escape character', () => {
      expect(unescapeDoubleQuoteString('hello\\eworld')).toBe('hello\x1bworld');
    });

    it('should unescape space', () => {
      expect(unescapeDoubleQuoteString('hello\\ world')).toBe('hello world');
    });

    it('should unescape slash', () => {
      expect(unescapeDoubleQuoteString('hello\\/world')).toBe('hello/world');
    });

    it('should unescape hex sequences (2 digits)', () => {
      expect(unescapeDoubleQuoteString('\\x41\\x42\\x43')).toBe('ABC');
    });

    it('should unescape unicode sequences (4 digits)', () => {
      expect(unescapeDoubleQuoteString('\\u0048\\u0065\\u006c\\u006c\\u006f')).toBe('Hello');
    });

    it('should unescape unicode sequences (8 digits)', () => {
      expect(unescapeDoubleQuoteString('\\U0001F600')).toBe('😀');
    });

    it('should handle multiple escapes', () => {
      expect(unescapeDoubleQuoteString('line1\\nline2\\ttab\\"quote\\\\')).toBe(
        'line1\nline2\ttab"quote\\'
      );
    });

    it('should handle empty string', () => {
      expect(unescapeDoubleQuoteString('')).toBe('');
    });

    it('should handle incomplete escape at end', () => {
      // Trailing backslash should be preserved
      expect(unescapeDoubleQuoteString('hello\\')).toBe('hello\\');
    });

    it('should handle invalid escape sequences', () => {
      // Unknown escapes like \q should be preserved or treated as literal
      expect(unescapeDoubleQuoteString('hello\\qworld')).toBe('hello\\qworld');
    });
  });

  describe('escapeSingleQuoteString', () => {
    it('should escape single quote by doubling', () => {
      expect(escapeSingleQuoteString("can't")).toBe("can''t");
    });

    it('should escape multiple single quotes', () => {
      expect(escapeSingleQuoteString("it's a 'test'")).toBe("it''s a ''test''");
    });

    it('should not escape double quotes', () => {
      expect(escapeSingleQuoteString('say "hello"')).toBe('say "hello"');
    });

    it('should not escape newlines', () => {
      expect(escapeSingleQuoteString('line1\nline2')).toBe('line1\nline2');
    });

    it('should handle empty string', () => {
      expect(escapeSingleQuoteString('')).toBe('');
    });

    it('should handle string with no quotes', () => {
      expect(escapeSingleQuoteString('hello world')).toBe('hello world');
    });
  });

  describe('unescapeSingleQuoteString', () => {
    it('should unescape doubled single quote', () => {
      expect(unescapeSingleQuoteString("can''t")).toBe("can't");
    });

    it('should unescape multiple doubled single quotes', () => {
      expect(unescapeSingleQuoteString("it''s a ''test''")).toBe("it's a 'test'");
    });

    it('should not process other escapes', () => {
      expect(unescapeSingleQuoteString('hello\\nworld')).toBe('hello\\nworld');
    });

    it('should handle empty string', () => {
      expect(unescapeSingleQuoteString('')).toBe('');
    });

    it('should handle string with no quotes', () => {
      expect(unescapeSingleQuoteString('hello world')).toBe('hello world');
    });
  });

  describe('parseYAMLNumber', () => {
    describe('decimal numbers', () => {
      it('should parse positive integer', () => {
        expect(parseYAMLNumber('123')).toBe(123);
      });

      it('should parse negative integer', () => {
        expect(parseYAMLNumber('-456')).toBe(-456);
      });

      it('should parse positive integer with plus sign', () => {
        expect(parseYAMLNumber('+789')).toBe(789);
      });

      it('should parse float', () => {
        expect(parseYAMLNumber('3.14')).toBe(3.14);
      });

      it('should parse negative float', () => {
        expect(parseYAMLNumber('-2.71')).toBe(-2.71);
      });

      it('should parse zero', () => {
        expect(parseYAMLNumber('0')).toBe(0);
      });
    });

    describe('exponential notation', () => {
      it('should parse positive exponent', () => {
        expect(parseYAMLNumber('1.23e+2')).toBe(123);
      });

      it('should parse negative exponent', () => {
        expect(parseYAMLNumber('1.5e-2')).toBe(0.015);
      });

      it('should parse exponent without sign', () => {
        expect(parseYAMLNumber('2e3')).toBe(2000);
      });

      it('should parse uppercase E', () => {
        expect(parseYAMLNumber('1.5E2')).toBe(150);
      });
    });

    describe('hexadecimal numbers', () => {
      it('should parse hex with lowercase prefix', () => {
        expect(parseYAMLNumber('0xFF')).toBe(255);
      });

      it('should parse hex with uppercase prefix', () => {
        expect(parseYAMLNumber('0XFF')).toBe(255);
      });

      it('should parse lowercase hex digits', () => {
        expect(parseYAMLNumber('0xabc')).toBe(2748);
      });

      it('should parse uppercase hex digits', () => {
        expect(parseYAMLNumber('0xABC')).toBe(2748);
      });
    });

    describe('octal numbers', () => {
      it('should parse octal with lowercase o', () => {
        expect(parseYAMLNumber('0o77')).toBe(63);
      });

      it('should parse octal with uppercase O', () => {
        expect(parseYAMLNumber('0O77')).toBe(63);
      });

      it('should parse octal digits', () => {
        expect(parseYAMLNumber('0o123')).toBe(83);
      });
    });

    describe('binary numbers', () => {
      it('should parse binary with lowercase b', () => {
        expect(parseYAMLNumber('0b1010')).toBe(10);
      });

      it('should parse binary with uppercase B', () => {
        expect(parseYAMLNumber('0B1010')).toBe(10);
      });

      it('should parse binary digits', () => {
        expect(parseYAMLNumber('0b11111111')).toBe(255);
      });
    });

    describe('special float values', () => {
      it('should parse positive infinity', () => {
        expect(parseYAMLNumber('.inf')).toBe(Infinity);
      });

      it('should parse negative infinity', () => {
        expect(parseYAMLNumber('-.inf')).toBe(-Infinity);
      });

      it('should parse positive infinity (uppercase)', () => {
        expect(parseYAMLNumber('.Inf')).toBe(Infinity);
      });

      it('should parse positive infinity (all caps)', () => {
        expect(parseYAMLNumber('.INF')).toBe(Infinity);
      });

      it('should parse NaN', () => {
        expect(parseYAMLNumber('.nan')).toBe(NaN);
      });

      it('should parse NaN (uppercase)', () => {
        expect(parseYAMLNumber('.NaN')).toBe(NaN);
      });

      it('should parse NaN (all caps)', () => {
        expect(parseYAMLNumber('.NAN')).toBe(NaN);
      });
    });
  });

  describe('normalizeBoolean', () => {
    it('should normalize "true" to true', () => {
      expect(normalizeBoolean('true')).toBe(true);
    });

    it('should normalize "false" to false', () => {
      expect(normalizeBoolean('false')).toBe(false);
    });

    it('should normalize "yes" to true', () => {
      expect(normalizeBoolean('yes')).toBe(true);
    });

    it('should normalize "no" to false', () => {
      expect(normalizeBoolean('no')).toBe(false);
    });

    it('should normalize "on" to true', () => {
      expect(normalizeBoolean('on')).toBe(true);
    });

    it('should normalize "off" to false', () => {
      expect(normalizeBoolean('off')).toBe(false);
    });

    it('should normalize "y" to true', () => {
      expect(normalizeBoolean('y')).toBe(true);
    });

    it('should normalize "n" to false', () => {
      expect(normalizeBoolean('n')).toBe(false);
    });

    it('should normalize "Yes" to true (case insensitive)', () => {
      expect(normalizeBoolean('Yes')).toBe(true);
    });

    it('should normalize "NO" to false (case insensitive)', () => {
      expect(normalizeBoolean('NO')).toBe(false);
    });

    it('should normalize "TRUE" to true (case insensitive)', () => {
      expect(normalizeBoolean('TRUE')).toBe(true);
    });

    it('should normalize "False" to false (case insensitive)', () => {
      expect(normalizeBoolean('False')).toBe(false);
    });

    it('should normalize "ON" to true (case insensitive)', () => {
      expect(normalizeBoolean('ON')).toBe(true);
    });

    it('should normalize "Off" to false (case insensitive)', () => {
      expect(normalizeBoolean('Off')).toBe(false);
    });
  });

  describe('normalizeNull', () => {
    it('should normalize "null" to null', () => {
      expect(normalizeNull('null')).toBe(null);
    });

    it('should normalize "~" to null', () => {
      expect(normalizeNull('~')).toBe(null);
    });

    it('should normalize "Null" to null (case insensitive)', () => {
      expect(normalizeNull('Null')).toBe(null);
    });

    it('should normalize "NULL" to null (case insensitive)', () => {
      expect(normalizeNull('NULL')).toBe(null);
    });

    it('should normalize empty string to null', () => {
      expect(normalizeNull('')).toBe(null);
    });
  });

  describe('isPlainSafe', () => {
    it('should return true for simple alphanumeric string', () => {
      expect(isPlainSafe('hello123')).toBe(true);
    });

    it('should return true for string with spaces', () => {
      expect(isPlainSafe('hello world')).toBe(true);
    });

    it('should return true for string with hyphens', () => {
      expect(isPlainSafe('hello-world')).toBe(true);
    });

    it('should return true for string with underscores', () => {
      expect(isPlainSafe('hello_world')).toBe(true);
    });

    it('should return false for string starting with dash and digit', () => {
      expect(isPlainSafe('-123')).toBe(false);
    });

    it('should return false for string that looks like boolean', () => {
      expect(isPlainSafe('true')).toBe(false);
      expect(isPlainSafe('false')).toBe(false);
      expect(isPlainSafe('yes')).toBe(false);
      expect(isPlainSafe('no')).toBe(false);
    });

    it('should return false for string that looks like null', () => {
      expect(isPlainSafe('null')).toBe(false);
      expect(isPlainSafe('~')).toBe(false);
    });

    it('should return false for string that looks like number', () => {
      expect(isPlainSafe('123')).toBe(false);
      expect(isPlainSafe('3.14')).toBe(false);
    });

    it('should return false for string with colon', () => {
      expect(isPlainSafe('key: value')).toBe(false);
    });

    it('should return false for string with hash (comment indicator)', () => {
      expect(isPlainSafe('hello # comment')).toBe(false);
    });

    it('should return false for string with quotes', () => {
      expect(isPlainSafe('hello "world"')).toBe(false);
      expect(isPlainSafe("hello 'world'")).toBe(false);
    });

    it('should return false for string with brackets', () => {
      expect(isPlainSafe('[1, 2, 3]')).toBe(false);
      expect(isPlainSafe('{key: value}')).toBe(false);
    });

    it('should return false for string with special YAML chars', () => {
      expect(isPlainSafe('&anchor')).toBe(false);
      expect(isPlainSafe('*alias')).toBe(false);
      expect(isPlainSafe('!tag')).toBe(false);
      expect(isPlainSafe('|literal')).toBe(false);
      expect(isPlainSafe('>folded')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPlainSafe('')).toBe(false);
    });

    it('should return false for string starting with @', () => {
      expect(isPlainSafe('@reserved')).toBe(false);
    });

    it('should return false for string starting with backtick', () => {
      expect(isPlainSafe('`reserved')).toBe(false);
    });
  });

  describe('normalizeIndent', () => {
    it('should return empty string for undefined', () => {
      expect(normalizeIndent(undefined)).toBe('');
    });

    it('should return empty string for 0', () => {
      expect(normalizeIndent(0)).toBe('');
    });

    it('should convert number to spaces', () => {
      expect(normalizeIndent(2)).toBe('  ');
      expect(normalizeIndent(4)).toBe('    ');
    });

    it('should return string as-is', () => {
      expect(normalizeIndent('\t')).toBe('\t');
      expect(normalizeIndent('  ')).toBe('  ');
    });

    it('should handle large indent', () => {
      expect(normalizeIndent(8)).toBe('        ');
    });
  });
});

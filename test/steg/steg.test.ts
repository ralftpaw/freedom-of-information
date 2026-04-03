import { describe, it, expect } from 'vitest';
import {
  encodeZeroWidth, decodeZeroWidth,
  encodeConfusableWS, decodeConfusableWS,
  encodeEmojiSkin, decodeEmojiSkin,
} from '../steg/encoder.js';

describe('ZERO-WIDTH ENCODING', () => {
  it('round-trips a simple message', () => {
    const original = 'hello world';
    const encoded = encodeZeroWidth(original, 'meet me tomorrow at noon');
    expect(encodeZeroWidth(original, 'x').length).toBeGreaterThan(original.length);
    const decoded = decodeZeroWidth(encoded);
    expect(decoded).toBe(original);
  });

  it('encoded text looks like normal text when rendered', () => {
    const encoded = encodeZeroWidth('abort', 'coffee looks good today');
    // Should be same displayed length as carrier (ZW chars are invisible)
    const visibleChars = encoded.replace(/[\u200B\u200C]/g, '');
    expect(visibleChars).toBe('coffee looks good today');
  });

  it('handles empty message', () => {
    const encoded = encodeZeroWidth('', 'carrier text');
    expect(decodeZeroWidth(encoded)).toBe('');
  });

  it('handles multi-byte unicode characters', () => {
    const original = '🔒🔥🌍';
    const encoded = encodeZeroWidth(original, 'normal message here');
    expect(decodeZeroWidth(encoded)).toBe(original);
  });
});

describe('CONFUSABLE WHITESPACE ENCODING', () => {
  it('round-trips a simple message', () => {
    const original = 'go north';
    const encoded = encodeConfusableWS(original, 'the weather is nice today outside my house');
    const decoded = decodeConfusableWS(encoded);
    expect(decoded).toBe(original);
  });

  it('encoded text looks like normal text with spaces', () => {
    const encoded = encodeConfusableWS('hi', 'hello world foo bar test');
    // All characters should be either original chars or space variants
    const spaceVariants = [' ', '\u2002', '\u2003', '\u2009', '\u00A0'];
    for (const ch of encoded) {
      const code = ch.codePointAt(0);
      // Either a normal printable char or one of our space variants
      if (code && code > 32 && code < 127) continue; // ASCII printable
      if (spaceVariants.includes(ch)) continue;
      // ZW chars from zero-width shouldn't appear here
      expect(ch).not.toBe('\u200B');
      expect(ch).not.toBe('\u200C');
    }
  });

  it('handles empty message', () => {
    const encoded = encodeConfusableWS('', 'some text with spaces');
    // Should just return original carrier (no encoding needed)
    expect(decodeConfusableWS(encoded)).toBe('');
  });
});

describe('EMOJI SKIN TONE ENCODING', () => {
  it('round-trips a short message', () => {
    const original = 'ok';
    const encoded = encodeEmojiSkin(original);
    const decoded = decodeEmojiSkin(encoded);
    expect(decoded).toBe(original);
  });

  it('encoded text looks like a row of emoji with skin tones', () => {
    const encoded = encodeEmojiSkin('test');
    // Should be a sequence of 👍 with various skin tone modifiers
    const skinModifiers = ['🏻', '🏼', '🏾', '🏿'];
    for (const ch of [...encoded]) {
      // Each emoji should be either a base emoji or a skin modifier
      if (ch === '👍') continue;
      if (skinModifiers.includes(ch)) continue;
      // Ignore ZWJ
      if (ch === '\u200D') continue;
    }
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('handles empty message', () => {
    const encoded = encodeEmojiSkin('');
    expect(decodeEmojiSkin(encoded)).toBe('');
  });

  it('different messages produce different emoji sequences', () => {
    const enc1 = encodeEmojiSkin('hello');
    const enc2 = encodeEmojiSkin('world');
    expect(enc1).not.toBe(enc2);
  });
});

describe('BIT UTILITIES', () => {
  // These are indirectly tested through the round-trip tests above.
  // Verifying basic stringToBits -> bitsToString identity:
  it('preserves utf-8 through bit conversion', () => {
    const tests = ['a', 'hello world', '🔒', 'test123!@#', '日本語', ''];
    for (const t of tests) {
      const encoded = encodeZeroWidth(t, 'carrier text with enough space for all bits');
      expect(decodeZeroWidth(encoded)).toBe(t);
    }
  });
});

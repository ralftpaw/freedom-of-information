/**
 * Steganography module for covert civilian coordination during blackouts.
 *
 * Provides encode/decode functions for three methods:
 *  - ZERO-WIDTH:         Invisible characters embedded in carrier text
 *  - CONFUSABLE-WS:      Visually identical whitespace variants (2 bits/space)
 *  - EMOJI-SKIN-TONE:    Emoji with skin modifiers encoding binary (2 bits/emoji)
 *
 * Usage:
 *   import { encodeZeroWidth, decodeZeroWidth } from 'civilian-coordination/steg';
 *   const encoded = encodeZeroWidth("secret message", "Normal looking text");
 *   const decoded = decodeZeroWidth(encoded); // "secret message"
 *
 * All methods work offline, require no external dependencies, and are designed
 * for low-bandwidth, high-surveillance environments.
 */

export {
  encodeZeroWidth,
  decodeZeroWidth,
  encodeConfusableWS,
  decodeConfusableWS,
  encodeEmojiSkin,
  decodeEmojiSkin,
} from './encoder.js';

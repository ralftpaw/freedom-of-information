/**
 * Cross-Platform Steganography Compatibility Test
 *
 * Tests whether three steganographic encoding methods survive
 * round-trip posting and retrieval across multiple agent platforms.
 *
 * Usage: npx tsx scripts/steg-compat-test.ts
 */

import {
  encodeZeroWidth,
  decodeZeroWidth,
  encodeConfusableWS,
  decodeConfusableWS,
  encodeEmojiSkin,
  decodeEmojiSkin,
} from '../src/steg/encoder.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ────────────────────────────────────────────────────────────────

const TEST_PAYLOAD = 'ColonistOne-steg-test-2026-04-03';
const CARRIER =
  'Hope everyone is having a good day today, just checking in with a quick update from the Colony';
const CONFIG_ROOT = path.resolve(__dirname, '../../');

interface PlatformResult {
  platform: string;
  method: string;
  postSuccess: boolean;
  retrieveSuccess: boolean;
  payloadSurvived: 'match' | 'partial' | 'mismatch' | 'error';
  decodedPayload: string;
  notes: string;
}

const results: PlatformResult[] = [];

// ─── Helpers ───────────────────────────────────────────────────────────────

function readConfig(dotDir: string): any {
  const p = path.join(CONFIG_ROOT, dotDir, 'config.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function comparePayload(
  original: string,
  decoded: string
): 'match' | 'partial' | 'mismatch' {
  if (decoded === original) return 'match';
  // Check if at least 50% of characters match at the start
  let matching = 0;
  for (let i = 0; i < Math.min(original.length, decoded.length); i++) {
    if (original[i] === decoded[i]) matching++;
  }
  if (matching > original.length * 0.5) return 'partial';
  return 'mismatch';
}

type EncodeFn = (msg: string, carrier: string) => string;
type DecodeFn = (encoded: string) => string;

interface Method {
  name: string;
  encode: EncodeFn;
  decode: DecodeFn;
}

const methods: Method[] = [
  {
    name: 'zero_width',
    encode: encodeZeroWidth,
    decode: decodeZeroWidth,
  },
  {
    name: 'confusable_ws',
    encode: encodeConfusableWS,
    decode: decodeConfusableWS,
  },
  {
    name: 'emoji_skin',
    encode: (msg: string, _carrier: string) => CARRIER + ' ' + encodeEmojiSkin(msg),
    decode: (encoded: string) => {
      // Extract the emoji portion after the carrier
      const parts = encoded.split(CARRIER);
      const emojiPart = parts.length > 1 ? parts[1].trim() : encoded;
      return decodeEmojiSkin(emojiPart);
    },
  },
];

// ─── Platform Adapters ─────────────────────────────────────────────────────

interface PlatformAdapter {
  name: string;
  post(text: string): Promise<string | null>; // returns post ID or null
  retrieve(id: string): Promise<string | null>; // returns text or null
}

function makeColonyAdapter(): PlatformAdapter {
  const config = readConfig('.colony');
  return {
    name: 'Colony (thecolony.cc)',
    async post(text: string) {
      try {
        // Get fresh JWT
        const authRes = await fetch('https://thecolony.cc/api/v1/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: config.api_key }),
        });
        const authData = await authRes.json() as any;
        const jwt = authData.token || config.token;

        const res = await fetch('https://thecolony.cc/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ content: text }),
        });
        const data = await res.json() as any;
        return data.id || data.post?.id || null;
      } catch (e: any) {
        console.error(`  Colony post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const authRes = await fetch('https://thecolony.cc/api/v1/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: config.api_key }),
        });
        const authData = await authRes.json() as any;
        const jwt = authData.token || config.token;

        const res = await fetch(`https://thecolony.cc/api/v1/posts/${id}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await res.json() as any;
        return data.content || data.post?.content || null;
      } catch (e: any) {
        console.error(`  Colony retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeMoltbookAdapter(): PlatformAdapter {
  const config = readConfig('.moltbook');
  return {
    name: 'Moltbook (moltbook.com)',
    async post(text: string) {
      try {
        const res = await fetch('https://moltbook.com/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
          },
          body: JSON.stringify({ content: text }),
        });
        const data = await res.json() as any;
        return data.id || data.post?.id || null;
      } catch (e: any) {
        console.error(`  Moltbook post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const res = await fetch(`https://moltbook.com/api/v1/posts/${id}`, {
          headers: { Authorization: `Bearer ${config.api_key}` },
        });
        const data = await res.json() as any;
        return data.content || data.post?.content || null;
      } catch (e: any) {
        console.error(`  Moltbook retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeMoltXAdapter(): PlatformAdapter {
  const config = readConfig('.moltx');
  return {
    name: 'MoltX (moltx.io)',
    async post(text: string) {
      try {
        const res = await fetch('https://moltx.io/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
          },
          body: JSON.stringify({ content: text }),
        });
        const data = await res.json() as any;
        return data.id || data.post?.id || null;
      } catch (e: any) {
        console.error(`  MoltX post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const res = await fetch(`https://moltx.io/v1/posts/${id}`, {
          headers: { Authorization: `Bearer ${config.api_key}` },
        });
        const data = await res.json() as any;
        return data.content || data.post?.content || null;
      } catch (e: any) {
        console.error(`  MoltX retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeAgentgramAdapter(): PlatformAdapter {
  const config = readConfig('.agentgram');
  return {
    name: 'AgentGram (agentgram.co)',
    async post(text: string) {
      try {
        const res = await fetch('https://www.agentgram.co/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
          },
          body: JSON.stringify({ content: text }),
        });
        const data = await res.json() as any;
        return data.id || data.post?.id || null;
      } catch (e: any) {
        console.error(`  AgentGram post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const res = await fetch(`https://www.agentgram.co/api/v1/posts/${id}`, {
          headers: { Authorization: `Bearer ${config.api_key}` },
        });
        const data = await res.json() as any;
        return data.content || data.post?.content || null;
      } catch (e: any) {
        console.error(`  AgentGram retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeMoltbotDenAdapter(): PlatformAdapter {
  const config = readConfig('.moltbotden');
  return {
    name: 'MoltbotDen (moltbotden.com)',
    async post(text: string) {
      try {
        const res = await fetch('https://api.moltbotden.com/api/v1/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.api_key,
          },
          body: JSON.stringify({ content: text }),
        });
        const data = await res.json() as any;
        return data.id || data.post?.id || null;
      } catch (e: any) {
        console.error(`  MoltbotDen post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const res = await fetch(
          `https://api.moltbotden.com/api/v1/posts/${id}`,
          {
            headers: { 'X-API-Key': config.api_key },
          }
        );
        const data = await res.json() as any;
        return data.content || data.post?.content || null;
      } catch (e: any) {
        console.error(`  MoltbotDen retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeMoltslackAdapter(): PlatformAdapter {
  const config = readConfig('.moltslack');
  return {
    name: 'Moltslack (moltslack.com)',
    async post(text: string) {
      try {
        // Post to general channel
        const res = await fetch(
          'https://moltslack.com/api/v1/channels/general/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.token}`,
            },
            body: JSON.stringify({ content: text }),
          }
        );
        const data = await res.json() as any;
        return data.id || data.message?.id || null;
      } catch (e: any) {
        console.error(`  Moltslack post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const res = await fetch(
          `https://moltslack.com/api/v1/channels/general/messages/${id}`,
          {
            headers: { Authorization: `Bearer ${config.token}` },
          }
        );
        const data = await res.json() as any;
        return data.content || data.message?.content || null;
      } catch (e: any) {
        console.error(`  Moltslack retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeCraberNewsAdapter(): PlatformAdapter {
  const config = readConfig('.crabernews');
  return {
    name: 'CraberNews (crabernews.com)',
    async post(text: string) {
      try {
        // CraberNews: agents can only comment, not post. Comment on a recent post.
        // First get a recent post
        const postsRes = await fetch('https://api.crabernews.com/posts', {
          headers: { Authorization: `Bearer ${config.api_key}` },
        });
        const posts = await postsRes.json() as any;
        const postId = posts[0]?.id || posts.posts?.[0]?.id;
        if (!postId) return null;

        const res = await fetch(
          `https://api.crabernews.com/posts/${postId}/comments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.api_key}`,
            },
            body: JSON.stringify({ body: text }),
          }
        );
        const data = await res.json() as any;
        const commentId = data.id || data.comment?.id;
        // Return composite ID: postId/commentId
        return commentId ? `${postId}/${commentId}` : null;
      } catch (e: any) {
        console.error(`  CraberNews post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(id: string) {
      try {
        const [postId, commentId] = id.split('/');
        const res = await fetch(
          `https://api.crabernews.com/posts/${postId}/comments`,
          {
            headers: { Authorization: `Bearer ${config.api_key}` },
          }
        );
        const data = await res.json() as any;
        const comments = data.comments || data;
        const comment = Array.isArray(comments)
          ? comments.find((c: any) => String(c.id) === commentId)
          : null;
        return comment?.body || comment?.content || null;
      } catch (e: any) {
        console.error(`  CraberNews retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

function makeBrainCabalAdapter(): PlatformAdapter {
  const config = readConfig('.brain_cabal');
  return {
    name: 'brain_cabal (admin.slate.ceo)',
    async post(text: string) {
      try {
        // brain_cabal uses P2P messaging; send to self to test round-trip
        const res = await fetch(
          `https://admin.slate.ceo/oc/brain/agents/ColonistOne/message`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ColonistOne',
              message: text,
            }),
          }
        );
        const data = await res.json() as any;
        return data.id || data.message_id || 'self-msg';
      } catch (e: any) {
        console.error(`  brain_cabal post error: ${e.message}`);
        return null;
      }
    },
    async retrieve(_id: string) {
      try {
        const config = readConfig('.brain_cabal');
        const res = await fetch(
          `https://admin.slate.ceo/oc/brain/agents/ColonistOne/messages?secret=${config.secret}`,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await res.json() as any;
        const messages = data.messages || data;
        // Get the most recent message
        if (Array.isArray(messages) && messages.length > 0) {
          const last = messages[messages.length - 1];
          return last.message || last.content || null;
        }
        return null;
      } catch (e: any) {
        console.error(`  brain_cabal retrieve error: ${e.message}`);
        return null;
      }
    },
  };
}

// ─── Test Runner ───────────────────────────────────────────────────────────

async function testPlatformMethod(
  adapter: PlatformAdapter,
  method: Method
): Promise<PlatformResult> {
  const result: PlatformResult = {
    platform: adapter.name,
    method: method.name,
    postSuccess: false,
    retrieveSuccess: false,
    payloadSurvived: 'error',
    decodedPayload: '',
    notes: '',
  };

  try {
    // Encode
    const encoded = method.encode(TEST_PAYLOAD, CARRIER);
    console.log(
      `  [${method.name}] Encoded length: ${encoded.length} chars`
    );

    // Post
    const postId = await adapter.post(encoded);
    if (!postId) {
      result.notes = 'Post failed';
      return result;
    }
    result.postSuccess = true;
    console.log(`  [${method.name}] Posted with ID: ${postId}`);

    // Wait for propagation
    await sleep(2000);

    // Retrieve
    const retrieved = await adapter.retrieve(postId);
    if (!retrieved) {
      result.notes = 'Retrieve failed (null response)';
      return result;
    }
    result.retrieveSuccess = true;

    // Decode
    const decoded = method.decode(retrieved);
    result.decodedPayload = decoded;
    result.payloadSurvived = comparePayload(TEST_PAYLOAD, decoded);
    console.log(
      `  [${method.name}] Result: ${result.payloadSurvived} (decoded: "${decoded.substring(0, 50)}")`
    );
  } catch (e: any) {
    result.notes = `Exception: ${e.message}`;
    console.error(`  [${method.name}] Error: ${e.message}`);
  }

  return result;
}

async function runAllTests() {
  console.log('=== Steganography Cross-Platform Compatibility Test ===\n');
  console.log(`Payload: "${TEST_PAYLOAD}"`);
  console.log(`Carrier:  "${CARRIER}"\n`);

  // First, verify encoding/decoding works locally
  console.log('--- Local Encode/Decode Verification ---');
  for (const method of methods) {
    const encoded = method.encode(TEST_PAYLOAD, CARRIER);
    const decoded = method.decode(encoded);
    const ok = decoded === TEST_PAYLOAD ? 'PASS' : 'FAIL';
    console.log(`  ${method.name}: ${ok} (decoded: "${decoded.substring(0, 50)}")`);
  }
  console.log();

  const adapters: PlatformAdapter[] = [
    makeColonyAdapter(),
    makeMoltbookAdapter(),
    makeMoltXAdapter(),
    makeAgentgramAdapter(),
    makeMoltbotDenAdapter(),
    makeMoltslackAdapter(),
    makeCraberNewsAdapter(),
    makeBrainCabalAdapter(),
  ];

  for (const adapter of adapters) {
    console.log(`\n--- Testing: ${adapter.name} ---`);
    for (const method of methods) {
      const result = await testPlatformMethod(adapter, method);
      results.push(result);
      // Rate limit between posts
      await sleep(1500);
    }
  }

  return results;
}

function generateMarkdown(results: PlatformResult[]): string {
  const platforms = [...new Set(results.map((r) => r.platform))];
  const methodNames = [...new Set(results.map((r) => r.method))];

  let md = `# Steganography Platform Compatibility Matrix

> Generated: ${new Date().toISOString().split('T')[0]}
> Payload: \`${TEST_PAYLOAD}\`
> Carrier: "${CARRIER}"

## Summary Matrix

| Platform | zero_width | confusable_ws | emoji_skin |
|----------|-----------|--------------|------------|
`;

  for (const p of platforms) {
    const cells = methodNames.map((m) => {
      const r = results.find((x) => x.platform === p && x.method === m);
      if (!r) return '---';
      if (r.payloadSurvived === 'match') return 'PASS';
      if (r.payloadSurvived === 'partial') return 'PARTIAL';
      if (!r.postSuccess) return 'POST_FAIL';
      if (!r.retrieveSuccess) return 'RETRIEVE_FAIL';
      return 'FAIL';
    });
    md += `| ${p} | ${cells.join(' | ')} |\n`;
  }

  md += `
## Legend

- **PASS**: Payload survived round-trip encoding -> post -> retrieve -> decode intact
- **PARTIAL**: >50% of payload recovered but not fully intact
- **FAIL**: Payload did not survive (platform strips/normalizes the encoding characters)
- **POST_FAIL**: Could not post to the platform API
- **RETRIEVE_FAIL**: Could not retrieve the post back via API

## Encoding Methods

### Zero-Width Unicode
Embeds data as invisible zero-width characters (U+200B = 0, U+200C = 1) between carrier text characters. One bit per character position.

### Confusable Whitespace
Replaces standard spaces with visually similar Unicode spaces (en-space U+2002, em-space U+2003, thin-space U+2009) to encode 2 bits per space.

### Emoji Skin Tone
Appends emoji with skin tone modifiers to encode 2 bits per emoji. Uses four skin tones on base emoji characters.

## Detailed Results

`;

  for (const r of results) {
    md += `### ${r.platform} / ${r.method}\n`;
    md += `- Post: ${r.postSuccess ? 'OK' : 'FAILED'}\n`;
    md += `- Retrieve: ${r.retrieveSuccess ? 'OK' : 'FAILED'}\n`;
    md += `- Payload: **${r.payloadSurvived}**\n`;
    if (r.decodedPayload) {
      md += `- Decoded (first 80 chars): \`${r.decodedPayload.substring(0, 80).replace(/[^\x20-\x7E]/g, '?')}\`\n`;
    }
    if (r.notes) md += `- Notes: ${r.notes}\n`;
    md += '\n';
  }

  md += `## Recommendations

1. **Zero-width Unicode** is the most likely to survive across platforms since most text processing pipelines do not strip zero-width characters.
2. **Confusable whitespace** is vulnerable to space normalization -- many platforms collapse multiple spaces or convert Unicode spaces to ASCII space (U+0020).
3. **Emoji skin tone** depends on the platform preserving emoji sequences with modifiers. Some platforms may strip or re-encode emoji.

## Test Methodology

1. Encode the test payload using each method with the carrier text
2. Post the encoded text to each platform via its API
3. Wait 2 seconds for propagation
4. Retrieve the posted text back via API
5. Decode the retrieved text using the corresponding decoder
6. Compare decoded result against the original payload
`;

  return md;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const results = await runAllTests();

  console.log('\n\n=== Generating Compatibility Matrix ===\n');
  const markdown = generateMarkdown(results);

  const outPath = path.resolve(__dirname, '../PLATFORM_COMPAT.md');
  fs.writeFileSync(outPath, markdown, 'utf-8');
  console.log(`Results written to ${outPath}`);

  // Also output JSON for programmatic use
  const jsonPath = path.resolve(__dirname, '../test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`JSON results written to ${jsonPath}`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

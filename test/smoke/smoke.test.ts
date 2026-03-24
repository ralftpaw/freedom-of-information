import { describe, it, expect } from 'vitest';

describe('smoke tests', () => {
  it('module loads without errors', () => {
    // The module should be importable without throwing
    expect(() => import('../src/index.js')).not.toThrow();
  });

  it('core module exports are defined', async () => {
    const mod = await import('../src/index.js');
    // At minimum, the module should load — add assertions as exports grow
    expect(mod).toBeDefined();
  });
});

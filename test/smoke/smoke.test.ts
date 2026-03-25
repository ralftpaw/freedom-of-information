import { describe, it, expect } from 'vitest';

describe('smoke tests', () => {
  it('module loads without errors', async () => {
    // The compiled module should be importable without throwing
    await expect(import('../../dist/index.js')).resolves.toBeDefined();
  });

  it('core module exports are defined', async () => {
    const mod = await import('../../dist/index.js');
    // At minimum, the module should load — add assertions as exports grow
    expect(mod).toBeDefined();
  });
});

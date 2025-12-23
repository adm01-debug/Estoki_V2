import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from './encryption';

describe('encryption', () => {
  it('should encrypt and decrypt data', async () => {
    const original = 'test data';
    const key = 'secret-key';
    const encrypted = await encryptData(original, key);
    expect(encrypted).not.toBe(original);
    const decrypted = await decryptData(encrypted, key);
    expect(decrypted).toBe(original);
  });
});

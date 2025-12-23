export const encryptData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, keyMaterial, encoder.encode(data)
  );
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
};

export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(key.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' }, false, ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, keyMaterial, ciphertext);
  return decoder.decode(decrypted);
};

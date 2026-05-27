const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const VERSION = 1;

async function deriveKey(
  passphrase: string,
  salt: ArrayBuffer
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(
  data: string,
  passphrase: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer);

  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );

  const versionByte = new Uint8Array([VERSION]);
  const combined = new Uint8Array(
    1 + SALT_LENGTH + IV_LENGTH + ciphertext.byteLength
  );
  combined.set(versionByte, 0);
  combined.set(salt, 1);
  combined.set(iv, 1 + SALT_LENGTH);
  combined.set(new Uint8Array(ciphertext), 1 + SALT_LENGTH + IV_LENGTH);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(
  encoded: string,
  passphrase: string
): Promise<string> {
  const raw = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

  const version = raw[0];
  if (version !== VERSION) {
    throw new Error(`Unsupported encryption version: ${version}`);
  }

  const salt = raw.slice(1, 1 + SALT_LENGTH);
  const iv = raw.slice(1 + SALT_LENGTH, 1 + SALT_LENGTH + IV_LENGTH);
  const ciphertext = raw.slice(1 + SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt.buffer as ArrayBuffer);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}

export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

import { execSync } from 'child_process';
import { createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { getMasterKey, getStretchedMasterKey, getMasterPasswordHash, createProtectedSymmetricKey } from '../../lib/auth/client/password.client';

describe("getMasterKey vs. Argon2 CLI", () => {
    const email = "alice@example.com";
    const password = "my_Password_123";
    const cmd = `printf ${password} | argon2 "$(printf ${email} | sha256sum | awk '{ print $1}' )" -id -t 3 -m 16 -p 4 -r`;
    const cliHash = execSync(cmd).toString().trim();
    test("produces the same output as Argon2 CLI", async () => {
        const buf = await getMasterKey(email, password);
        expect(buf).toHaveLength(32);
        expect(Buffer.from(buf).toString('hex')).toBe(cliHash);
    });
});

describe("getStretchedMasterKey vs Node hkdf", () => {
    const masterKey = Buffer.alloc(32, 0x1);
    const expectedKey = hkdfSync("sha256", masterKey, Buffer.alloc(0), Buffer.alloc(0), 64);
    const stretched = getStretchedMasterKey(masterKey);
    test("produces the same output as Node hkdf", () => {
        expect(stretched.buffer).toEqual(expectedKey);
    })
});

describe("getProtectedSymmetricKey", () => {
    const stretched = randomBytes(64);
    const symmetricKey = randomBytes(64);
    const iv = randomBytes(16);
    const decipher = createDecipheriv('aes-256-cbc', stretched.subarray(0, 32), iv);
    const [psKey, hmac] = createProtectedSymmetricKey(stretched, symmetricKey, iv);
    const psKeyRes = Buffer.from(psKey, 'base64');
    test("iv matches", () => {
        const foundIV = psKeyRes.subarray(0, 16);
        expect(foundIV).toEqual(iv);
    });
    test("can be decrypted correctly", () => {
        const protectedKey = psKeyRes.subarray(16);
        const decrypted = Buffer.concat([decipher.update(protectedKey), decipher.final()]);
        expect(decrypted).toEqual(symmetricKey);
    });
});

describe("getMasterPasswordHash (client) vs. Argon2 CLI", () => {
    const masterKey = Buffer.alloc(32, "a".charCodeAt(0));
    const password = "my_Password_123";
    const cliHash = execSync(
            `printf ${"a".repeat(32)} | argon2 '${password}' -id \
            -t 2 \
            -m 16 \
            -p 2 \
            -r | xxd -r -p | base64`).toString().trim();
    test("produces the same output as Argon2 CLI", async () => {
        const buf = await getMasterPasswordHash(masterKey, password);
        expect(buf).toBe(cliHash);
    });
});
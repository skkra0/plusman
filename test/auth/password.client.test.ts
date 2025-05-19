import { execSync } from 'child_process';
import { hkdfSync } from 'node:crypto';
import { getMasterKey, getStretchedMasterKey, getMasterPasswordHash } from '../../lib/auth/client/password.client';

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
})
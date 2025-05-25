import { execSync } from 'child_process';
import { hkdfSync, createCipheriv, randomBytes, randomInt, createHmac, pseudoRandomBytes } from 'node:crypto';
import { decryptAndVerify, encryptAndSign, getMasterKey, getMasterPasswordHash, parseStoredCiphertext, stretchKey, wrapKey } from '../../lib/auth/client/password.client';

describe("parseStoredCiphertext", () => {
    for (let i = 0; i < 5; i++) {
        test("Decodes to correct input", () => {
            const part1 = randomBytes(16);
            const part2 = randomBytes(randomInt(64));
            const part3 = randomBytes(64);
            const encoded = ([part1.toString("base64"), part2.toString("base64"), part3.toString("base64")]).join("|");
            const { iv, text, hmac } = parseStoredCiphertext(encoded);
            expect(Buffer.from(iv)).toEqual(part1);
            expect(Buffer.from(text)).toEqual(part2);
            expect(Buffer.from(hmac)).toEqual(part3);
        });
    }
});

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
    for (let i = 0; i < 5; i++) {
        const masterKey = new Uint8Array(randomBytes(32));
        const expectedKey = new Uint8Array(hkdfSync("sha256", masterKey, Buffer.alloc(0), Buffer.alloc(0), 64));
        test("Produces the correct stretched key", async () => {
            const stretched = await stretchKey(masterKey);
            expect(stretched).toEqual(expectedKey);
        });
    }
});

describe("getMasterPasswordHash (client) vs. Argon2 CLI", () => {
    for (let i = 0; i < 2; i++) {
        const masterKey = randomBytes(16).toString('hex');
        const password = pseudoRandomBytes(randomInt(6) + 6).toString('hex');
        const cliHash = execSync(
                `printf ${masterKey} | argon2 ${password} -id \
                -t 2 \
                -m 16 \
                -p 2 \
                -r | xxd -r -p | base64`).toString().trim();
        test("produces the same output as Argon2 CLI", async () => {
            const buf = await getMasterPasswordHash(new Uint8Array(Buffer.from(masterKey)), password);
            expect(buf).toBe(cliHash);
        });
    }
});

describe("encryptAndSign vs. node Cipher and HMAC", () => {
    const symmetricKey = pseudoRandomBytes(64);
    const encryptionKey = symmetricKey.subarray(0, 32);
    const authKey = symmetricKey.subarray(32);

    for (let i = 0; i < 5; i++) {
        const knownIV = new Uint8Array(randomBytes(16));
        const data = new Uint8Array(randomBytes(randomInt(64)));

        const cipher = createCipheriv('aes-256-cbc', encryptionKey, knownIV);
        const sign = createHmac('sha512', authKey);
        const expectCtxt = Buffer.concat([cipher.update(data), cipher.final()]);
        sign.update(data);
        const expectSignature = sign.digest();
        
        test("produces the same ciphertext and signature", async () => {
            const cryptokeys = await wrapKey(new Uint8Array(symmetricKey));
            const { iv, text, hmac } = parseStoredCiphertext(await encryptAndSign(cryptokeys, data, knownIV));
            expect(iv).toEqual(knownIV);
            expect(Buffer.from(text)).toEqual(expectCtxt);
            expect(Buffer.from(hmac)).toEqual(expectSignature);
        })
    }
});

describe("decryptAndVerify vs. node Cipher and HMAC", () => {
    const symmetricKey = pseudoRandomBytes(64);
    const encryptionKey = symmetricKey.subarray(0, 32);
    const authKey = symmetricKey.subarray(32);
    for (let i = 0; i < 5; i++) {
        const knownIV = randomBytes(16);
        const data = randomBytes(randomInt(64));

        const cipher = createCipheriv('aes-256-cbc', encryptionKey, knownIV);
        const sign = createHmac('sha512', authKey);
        const ctxt = Buffer.concat([cipher.update(data), cipher.final()]);
        sign.update(data);
        const signature = sign.digest();

        test("decrypts correctly", async () => {
            const combinedCtxt = [knownIV.toString('base64'), ctxt.toString('base64'), signature.toString('base64')].join('|');
            const cryptokeys = await wrapKey(new Uint8Array(symmetricKey));
            const decrypted = await decryptAndVerify(cryptokeys, combinedCtxt);
            expect(Buffer.from(decrypted)).toEqual(data);
        });
    }
});
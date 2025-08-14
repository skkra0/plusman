import { test, describe } from 'node:test';
import { execSync } from 'child_process';
import { createCipheriv, randomBytes, randomInt } from 'node:crypto';
import { decrypt, encrypt, getCryptoKey, getMasterKey, getMasterPasswordHash, parseStoredCiphertext, validatePassword } from '../../lib/auth/client/password.client.js';
import assert from 'node:assert';

describe("validatePassword", () => {
    const failingPasswords = ["short", "too_short", "iamtooshort"];
    const okPasswords = ["______ok____"];
    for (let pw of failingPasswords) {
        test("Rejects short password", () => {
            assert.strictEqual(validatePassword(pw).code, "TOO_SHORT");
        });
    }

    for (let pw of okPasswords) {
        test("Accepts long password", () => {
            assert.strictEqual(validatePassword(pw).code, "OK");
        });
    }
})

describe("parseStoredCiphertext", () => {
    const encoded = [
        ["5dthfv7Tpxgk31U8", "OMEfrbws2X2BUsgoSz/uilSONAV6Urgrs7qORzqEdL1nnQT7I62q1BwUIUzpXOAIpExCSrmxY0c=", "xO86p/1xeV0cr0/wmXbUVw=="],
        ["PlubmCvOmxWaCI54", "3X6SQ42asIBCGnG27ANeUE1u6Ql7DOdd9/8AxLHnXzeUURs7NWpBKD8fhw==", "AstoSdI1a230D7S3s0PZ9w=="],
        ["kNSoRspoKLl+9vHj", "HqFpI9q8NSfo35U1KL9KUPIxEA0kBpkPDhqzgIaPoeCUyKq1j2j5jK48MZG2QdgqYN7jZfL3mt1mM975", "dCnxaN5TMdi6aAtoKXfnhw=="],
        ["G0ivXD/S+G+ZIcI7", "yB6fxoAIEv93eDKZR0kxVdXnlCmwghmyxFJnaYZKTitTsuNyoWvbWXoP", "sQbxdxLaxNzXOtwKx9QNUg=="],
        ["9KY4quVMIbvmMPyj", "W07NRjvrM5iGfcEHDyHrGEkiTDClfY3Wo29rGYcw3IeMSR/6Bi6Gsw==", "sz5t9UmOq1rx6HCn5jMDHA=="]
    ];

    for (let i = 0; i < 5; i++) {
        test("Decodes to correct input", () => {
            const values = encoded[i];
            const { iv, text, authTag } = parseStoredCiphertext(`${values[0]}|${values[1]}|${values[2]}`);
            assert.deepStrictEqual(Buffer.from(iv), Buffer.from(values[0], "base64"));
            assert.deepStrictEqual(Buffer.from(text), Buffer.from(values[1], "base64"));
            assert.deepStrictEqual(Buffer.from(authTag), Buffer.from(values[2], "base64"));
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
        assert.strictEqual(buf.length, 32);
        assert.strictEqual(Buffer.from(buf).toString('hex'), cliHash);
    });
});

describe("getMasterPasswordHash (client) vs. Argon2 CLI", () => {
    for (let i = 0; i < 2; i++) {
        const masterKey = randomBytes(16).toString('hex');
        const password = randomBytes(randomInt(6) + 6).toString('hex');
        const cliHash = execSync(
            `printf ${masterKey} | argon2 ${password} -id \
                -t 3 \
                -m 16 \
                -p 4 \
                -r | xxd -r -p | base64`).toString().trim();
        test("produces the same output as Argon2 CLI", async () => {
            const buf = await getMasterPasswordHash(new Uint8Array(Buffer.from(masterKey)), password);
            assert.strictEqual(buf, cliHash);
        });
    }
});

describe("encrypt vs. node Cipher", () => {
    const data = [
        ["ZX0f5p8ZL646Nxq0rf8BwmDZzHF/OEAuo4//mSz/6zI=", "aZI3yK/E7Gk76qLx", "q4YpLzw0nkY+HXfcfTDCxoD+nX63FB2y7QlH4B3f4U8="],
        ["efMf9S//FXF9/UOdKFeNMf18uOJVcxlrSmf3xstqStE=", "3QAmzUVQRj2RH17w", "xpqiFUWAEYPq4pMPq9/RiGZHOV5YBqDAiTxj0qK5"],
        ["ICIgDvqzTcr1OxynH+fplcQma2vkjk00VKPGXY4pal8=", "agJM9jF2je9noMow", "i1WwwJB8R7mAZA=="],
        ["Rk+sdObZOjPrqwpiZTl3/dV58Zcal0R08aA302wED0M=", "CLUmeKP2TuDEBV0D", "R0PH/p3PRgK47HI3FUqh3a8CPnmhKPwmyvhwY2SjuXDnhZWgbtiK3AM6NTZHPIU="],
        ["yfYD936Jsrl9r5FHXe6XoguJ6dVkLZtcnpvhiiISZKU=", "WJ/4hubOzURLk4LH", "eOi29Kj3HwN2IcGJUf/ZnY8J3OZlrlhCOrlPjsHq9utTgJ0="]
    ];

    for (let values of data) {
        const [key, knownIV, ptxt] = Buffer.from(values, "base64");
        const cipher = createCipheriv('aes-256-gcm', key, knownIV);
        const expectCtxt = Buffer.concat([cipher.update(ptxt), cipher.final()]);
        const expectAuthTag = cipher.getAuthTag();
        test("produces the same ciphertext and signature", async () => {
            const cryptokey = await getCryptoKey(key);
            const { iv, text, authTag } = parseStoredCiphertext(await encrypt(cryptokey, ptxt, knownIV));
            assert.deepStrictEqual(Buffer.from(iv), knownIV);
            assert.deepStrictEqual(Buffer.from(text), expectCtxt);
            assert.deepStrictEqual(Buffer.from(authTag), expectAuthTag);
        });
    }
});

describe("decrypt vs. node Cipher", () => {
    const data = [
        ["RXtg32t8o5XO9ugcoKauq2D91FQ5Fn4+FzeAg4E4oPU=", "KtS+AFm9f7BYOOW3", "G4EsFt8AwviKqWogMIkNP3LPMzdXt31Y+hXmpMkrQA=="],
        ["6l5W9WUhCQdz1wrm49AAc601sF4bIJYTNhp9g+JL240=", "+tgn5al1p2SmUYrc", "COOynarTfA=="],
        ["5kivu0be5CV1v5vXczLhs+2IPcCPRJjbDAn0IgY+qF4=", "uixQa/qOw2eYTX87", "GdOqFPUnZK6GH1zP1tsKHS79jyywAEOJUS/1A1OJk6K76UcftYF5FYY5lRR8PauBYb28nL5SYMwTXJA="],
        ["zrfdhQUjzDNFloG2tU3+NIZfUqLcKt54TjKYaGHyUvA=", "3ZhRWX4UVzjzy6on", "FPqjLIxqvM6fFtexG47lroi8JLSErjxlTjfBsbEBqBdj"],
        ["CHJioyvCJ5FiL/Czl+jmc2P6IomPeynoD3vklBBVjJ8=", "Bh3HrB5q9VQFZ615", "usNvqOwTn324t5Sz63ZyaA=="],
    ];
    for (let values of data) {
        const [key, knownIV, ptxt] = Buffer.from(values, "base64");

        const cipher = createCipheriv('aes-256-gcm', key, knownIV);
        const enc = Buffer.concat([cipher.update(ptxt), cipher.final()]);
        const authTag = cipher.getAuthTag();

        test("decrypts correctly", async () => {
            const ctxt = [knownIV.toString('base64'), enc.toString('base64'), authTag.toString('base64')].join('|');
            const cryptokey = await getCryptoKey(key);
            const decrypted = await decrypt(cryptokey, ctxt);
            assert.deepStrictEqual(Buffer.from(decrypted), ptxt);
        });
    }
});


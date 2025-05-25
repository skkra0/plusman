import { execSync } from 'node:child_process';
import { getMasterPasswordHash } from '../../lib/auth/server/password.server';
import { randomBytes } from 'node:crypto';

describe("getMasterPasswordHash (server) vs. Argon2 CLI", () => {
    for (let i = 0; i < 2; i++) {
        const base = randomBytes(16).toString('hex');
        const salt = randomBytes(16).toString('hex');
        const cliHash = execSync(`printf ${base} | argon2 ${salt} -id -t 3 -m 16 -p 4 -e`).toString().trim();
        test("produces the same output as Argon2 CLI", async () => {
            const passwordHash = await getMasterPasswordHash(btoa(base), Buffer.from(salt, "utf-8"));
            expect(passwordHash).toBe(cliHash);
        });
    }
})
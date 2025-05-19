import { execSync } from 'node:child_process';
import { getMasterPasswordHash } from '../../lib/auth/server/password.server';

describe("getMasterPasswordHash (server) vs. Argon2 CLI", () => {
    const base = "my_Password_1234my_Password_1234";
    const salt = "a".repeat(32);
    const cliHash = execSync(`printf ${base} | argon2 ${salt} -id -t 3 -m 16 -p 4 -e`).toString().trim();
    test("produces the same output as Argon2 CLI", async () => {
        const passwordHash = await getMasterPasswordHash(btoa(base), Buffer.from(salt, "utf-8"));
        expect(passwordHash).toBe(cliHash);
    })
})
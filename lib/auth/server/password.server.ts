import { argon2id, hash, verify } from 'argon2';
import { randomBytes } from 'node:crypto';

export const getMasterPasswordHash = async (clientHash: string, salt?: Buffer) => {
    const decoded = Buffer.from(clientHash, 'base64');
    if (!salt) {
        salt = randomBytes(32);
    }
    const passwordHash = await hash(decoded, {
        hashLength: 32, // 256-bit
        timeCost: 3, // 3 iterations
        memoryCost: 1 << 16, // 64 MiB
        parallelism: 4, // 4 threads
        salt,
        type: argon2id
    });

    return passwordHash;
};
export const comparePasswords = async (clientHash: string, passwordHash: string) => {
    try {
        return await verify(passwordHash, clientHash);
    } catch (err) {
        console.log(err);
    }
}
import hkdf from 'futoin-hkdf';
import { createCipheriv, randomBytes } from 'crypto';
import { argon2id, sha256 } from 'hash-wasm';

const MIN_LEN = 12;

export interface PasswordQuality {
    code: 'TOO_SHORT' | 'OK';
    msg: string;
};

export const validatePassword = (pw: string) : PasswordQuality => {
    if (pw.length < MIN_LEN) {
        return {
            code: 'TOO_SHORT',
            msg: `Password must be at least ${MIN_LEN} characters long.`
        }
    }

    return {
        code: 'OK',
        msg: '',
    }
};

export const getMasterKey = async (email: string, password: string) => {   
    const normalized = email.trim().toLowerCase();
    const salt = await sha256(normalized); 
    const masterKey = await argon2id({
        password,
        salt,
        hashLength: 32,
        parallelism: 4,
        iterations: 3,
        memorySize: 65536,
        outputType: "binary"
    });

    return Buffer.from(masterKey);
};

export const getStretchedMasterKey = (masterKey: Buffer) => {
    return hkdf(masterKey, 64, { hash: 'SHA-256' });
}

export const getProtectedSymmetricKey = async (masterKey: Buffer) => {
    const stretchedMasterKey = getStretchedMasterKey(masterKey);
    const generatedSymmetricKey = randomBytes(64);
    const iv = randomBytes(16);

    const cipher = createCipheriv('aes-256-cbc', stretchedMasterKey.subarray(0, 32), iv);

    let encrypted = cipher.update(generatedSymmetricKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('base64');
}

export const getMasterPasswordHash = async (masterKey: Buffer, password: string) => {
    const masterHashResult = await argon2id({
        password: masterKey,
        salt: password,
        hashLength: 32,
        iterations: 2,
        memorySize: 65536,
        parallelism: 2,
        outputType: "binary"
    });

    return Buffer.from(masterHashResult).toString('base64');
};
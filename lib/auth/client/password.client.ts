import hkdf from 'futoin-hkdf';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomFill } from 'crypto';
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

export const genSymmetricKey = () : Buffer<ArrayBuffer> => {
    const buf = Buffer.alloc(64);
    randomFill(buf, (err, buf) => {
        if (err) throw err;
    });
    return buf;
}

export const getHmac = (key: Buffer, symmetricKey: Buffer) => {
    const hmac = createHmac('sha512', key);
    hmac.update(symmetricKey);

    return hmac.digest();
}

export const createProtectedSymmetricKey = (stretchedMasterKey: Buffer, sk?: Buffer, iv?: Buffer) => {
    const symmetricKey = sk ? sk : randomBytes(64);
    const initVec = iv ? iv : randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', stretchedMasterKey.subarray(0, 32), initVec);
    const protectedKey = Buffer.concat([initVec, cipher.update(symmetricKey), cipher.final()]);
    
    const hmac = getHmac(stretchedMasterKey.subarray(32), symmetricKey);
    return [protectedKey.toString('base64'), hmac.toString('base64')];
}

export const decryptSymmetricKey = (key: Buffer, protectedSymmetricKey: string) => {
    const buf = Buffer.from(protectedSymmetricKey, 'base64');
    const iv = buf.subarray(0, 16);
    const protectedKey = buf.subarray(16);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);

    return Buffer.concat([decipher.update(protectedKey), decipher.final()]);
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

export const getEncryptionCryptoKey = async (key: Buffer<ArrayBuffer>) => {
    return crypto.subtle.importKey('raw', key, {name: 'AES-CBC'} , false, ['encrypt', 'decrypt']);
}

export const getHmacCryptoKey = async (key: Buffer<ArrayBuffer>) => {
    return crypto.subtle.importKey('raw', key, { name: 'HMAC', 'hash': 'sha512'}, false, ['sign', 'verify'])
}
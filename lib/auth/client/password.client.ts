import hkdf from 'futoin-hkdf';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomFill } from 'crypto';
import { argon2id, sha256 } from 'hash-wasm';

const MIN_LEN = 12;
const ENCRYPTED_KEY_PARTS = 3;

export interface PasswordQuality {
    code: 'TOO_SHORT' | 'OK';
    msg: string;
};

export interface DoubleKey {
    encryptionKey: Buffer,
    authKey: Buffer,
}

export interface DoubleCryptoKey {
    encryptionKey: CryptoKey,
    authKey: CryptoKey
}

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

export const encryptWithMAC = (key: DoubleKey, data: Buffer, iv?: Buffer) : Buffer[] => {
    if (!iv) {
        iv = randomBytes(16);
    }

    const cipher = createCipheriv('aes-256-cbc', key.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const hmac = getHmac(key.authKey, data);
    return [iv, encrypted, hmac];
}

export const getEncodedCiphertext = async (key: DoubleCryptoKey, data: Buffer<ArrayBuffer>, iv?: Buffer) : Promise<string> => {
    if (!iv) {
        iv = randomBytes(16);
    }
    const encrypted = Buffer.from(await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv.buffer.slice(0, 16) as ArrayBuffer }, key.encryptionKey, data));
    const hmac = Buffer.from(await crypto.subtle.sign('HMAC', key.authKey, data));

    return encodeCiphertext([iv, encrypted, hmac]);
}

export const decryptAndVerify = (key: DoubleKey, data: string) : Buffer<ArrayBuffer> => {
    const { iv, text, hmac } = parseStoredCiphertext(data);
    const decipher = createDecipheriv('aes-256-cbc', key.encryptionKey, iv);
    const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
    const foundHmac = getHmac(key.authKey, decrypted);

    if (!foundHmac.equals(hmac)) {
        throw new Error("Invalid data.");
    }
    
    return decrypted;
}

export const decryptAndVerifyCrypto = async (key: DoubleCryptoKey, data: string) : Promise<string> => {
    const { iv, text, hmac} = parseStoredCiphertext(data);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key.encryptionKey, text);
    const hmacMatches = await crypto.subtle.verify('HMAC', key.authKey, hmac, decrypted);
    if (!hmacMatches) {
        throw new Error("Invalid data.");
    }
    return Buffer.from(decrypted).toString('utf-8');
}

export const getMasterKey = async (email: string, password: string) : Promise<Buffer> => {   
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

export const getStretchedMasterKey = (masterKey: Buffer): DoubleKey => {
    const stretched = hkdf(masterKey, 64, { hash: 'SHA-256' });
    const encryptionKey = stretched.subarray(0, 32);
    const authKey = stretched.subarray(32);
    return { encryptionKey, authKey };
}

export const getMasterPasswordHash = async (masterKey: Buffer, password: string) : Promise<string> => {
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

export const genSymmetricKey = () : Buffer<ArrayBuffer> => {
    const buf = Buffer.alloc(64);
    randomFill(buf, (err, buf) => {
        if (err) throw err;
    });
    return buf;
}

export const createEncodedProtectedKey = (stretchedMasterKey: DoubleKey, sk?: Buffer, iv?: Buffer) : string => {
    const symmetricKey = sk ? sk : randomBytes(64);
    const initVec = iv ? iv : randomBytes(16);
    return encodeCiphertext(encryptWithMAC(stretchedMasterKey, symmetricKey, initVec));
}

export const getUserKeys = async (key: DoubleKey, encryptedKey: string) : Promise<DoubleCryptoKey> => {
    const symmetricKey = decryptAndVerify(key, encryptedKey);
    
    const encryptionKey = await getEncryptionCryptoKey(symmetricKey.subarray(0, 32));
    const authKey = await getHmacCryptoKey(symmetricKey.subarray(32));
    return { encryptionKey, authKey };
}

const getHmac = (key: Buffer, symmetricKey: Buffer) : Buffer => {
    const hmac = createHmac('sha512', key);
    hmac.update(symmetricKey);

    return hmac.digest();
}

const parseStoredCiphertext = (encryptedKey: string) => {
    const parts = encryptedKey.split('|')
    if (parts.length != ENCRYPTED_KEY_PARTS) {
        throw new Error("Invalid data");
    }
    const iv = Buffer.from(parts[0], 'base64');
    const text = Buffer.from(parts[1], 'base64');
    const hmac = Buffer.from(parts[2], 'base64');

    return { iv, text, hmac };
}

const encodeCiphertext = (data: Buffer[]) : string => {
    const [iv, text, hmac] = data;
    const parts = [iv.toString('base64'), text.toString('base64'), hmac.toString('base64')];
    return parts.join('|');
}

export const getEncryptionCryptoKey = async (key: Buffer<ArrayBuffer>) : Promise<CryptoKey> => {
    return crypto.subtle.importKey('raw', key, {name: 'AES-CBC'} , false, ['encrypt', 'decrypt']);
}

export const getHmacCryptoKey = async (key: Buffer<ArrayBuffer>) : Promise<CryptoKey> => {
    return crypto.subtle.importKey('raw', key, { name: 'HMAC', 'hash': { 'name' : 'SHA-512' } }, false, ['sign', 'verify']);
}
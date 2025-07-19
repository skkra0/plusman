'use client'
import { argon2id, sha256 } from 'hash-wasm';

const MIN_LEN = 12;
const ENCRYPTED_KEY_PARTS = 3;

export interface PasswordQuality {
    code: 'TOO_SHORT' | 'OK';
    msg: string;
};

export interface DoubleCryptoKey {
    encryptionKey: CryptoKey,
    authKey: CryptoKey
}

export const validatePassword = (pw: string): PasswordQuality => {
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

export const encryptAndSign = async (
    key: DoubleCryptoKey,
    data: Uint8Array<ArrayBuffer>,
    iv?: Uint8Array<ArrayBuffer>): Promise<string> => {
    if (!iv) {
        iv = crypto.getRandomValues(new Uint8Array(16));
    }

    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key.encryptionKey, data));

    const combined = new Uint8Array(iv.length + encrypted.length);
    combined.set(iv);
    combined.set(encrypted, iv.length);
    const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', key.authKey, combined));

    return encodeCiphertext(iv, encrypted, hmac);
}

export const decryptAndVerify = async (key: DoubleCryptoKey, data: string): Promise<ArrayBuffer> => {
    const { iv, text, hmac } = parseStoredCiphertext(data);
    const combined = new Uint8Array(iv.length + text.length);
    combined.set(iv);
    combined.set(text, iv.length);
    const hmacMatches = await crypto.subtle.verify('HMAC', key.authKey, hmac, combined);
    if (!hmacMatches) {
        throw new Error("Invalid data.");
    }

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key.encryptionKey,
        text
    );
    return decrypted;
}

export const getMasterKey = async (email: string, password: string): Promise<Uint8Array> => {
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

    return masterKey;
};

export const stretchKey = async (baseKey: Uint8Array): Promise<Uint8Array> => {
    const baseKeyWrapped = await crypto.subtle.importKey("raw", new Uint8Array(baseKey), "HKDF", false, ["deriveBits"]);
    const stretched = new Uint8Array(await crypto.subtle.deriveBits(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: new Uint8Array(32),
            info: new TextEncoder().encode(""),
        },
        baseKeyWrapped,
        512));
    return stretched;
}

export const getStretchedMasterKey = async (masterKey: Uint8Array): Promise<DoubleCryptoKey> => {
    const stretched = await stretchKey(masterKey);
    const encryptionKey = new Uint8Array(stretched.subarray(0, 32));
    const authKey = new Uint8Array(stretched.subarray(32));
    return {
        encryptionKey: await getEncryptionCryptoKey(encryptionKey),
        authKey: await getAuthCryptoKey(authKey),
    };
}

export const getMasterPasswordHash = async (masterKey: Uint8Array, password: string): Promise<string> => {
    const masterHashResult = await argon2id({
        password: masterKey,
        salt: password,
        hashLength: 32,
        iterations: 2,
        memorySize: 65536,
        parallelism: 2,
        outputType: "binary"
    });
    return uint8ArrayToB64(masterHashResult);
};

export const genSymmetricKey = () : Uint8Array<ArrayBuffer> => {
    return crypto.getRandomValues(new Uint8Array(64));
}

export const wrapKey = async (symmetricKey: Uint8Array<ArrayBuffer>) => {
    const encryptionKey = await getEncryptionCryptoKey(symmetricKey.subarray(0, 32));
    const authKey = await getAuthCryptoKey(symmetricKey.subarray(32));
    return { encryptionKey, authKey };
}

export const getUserKeys = async (key: DoubleCryptoKey, encryptedKey: string): Promise<DoubleCryptoKey> => {
    const symmetricKey = new Uint8Array(await decryptAndVerify(key, encryptedKey));
    return wrapKey(symmetricKey);
}

export const parseStoredCiphertext = (encoded: string) : {
    iv: Uint8Array<ArrayBuffer>,
    text: Uint8Array<ArrayBuffer>,
    hmac: Uint8Array<ArrayBuffer>
} => {
    const parts = encoded.split('|')
    if (parts.length != ENCRYPTED_KEY_PARTS) {
        throw new Error("Invalid data");
    }
    const iv = b64ToUint8Array(parts[0]);
    const text = b64ToUint8Array(parts[1]);
    const hmac = b64ToUint8Array(parts[2]);

    return { iv, text, hmac };
}

const encodeCiphertext = (iv: Uint8Array, text: Uint8Array, hmac: Uint8Array): string => {
    const parts = [uint8ArrayToB64(iv), uint8ArrayToB64(text), uint8ArrayToB64(hmac)];
    return parts.join('|');
}

export const getEncryptionCryptoKey = async (key: BufferSource): Promise<CryptoKey> => {
    return crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

export const getAuthCryptoKey = async (key: BufferSource): Promise<CryptoKey> => {
    return crypto.subtle.importKey('raw', key, { name: 'HMAC', 'hash': { 'name': 'SHA-512' } }, false, ['sign', 'verify']);
}

const uint8ArrayToB64 = (arr: Uint8Array) : string => {
    let bin = "";
    for (let byte of arr) {
        bin += String.fromCharCode(byte);
    }

    return btoa(bin);
}

const b64ToUint8Array = (encoded: string) => {
    const bin = atob(encoded);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return arr;
}
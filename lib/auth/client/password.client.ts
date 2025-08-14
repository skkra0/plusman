'use client'
import { argon2id, sha256 } from 'hash-wasm';

const MIN_LEN = 12;
const ENCRYPTED_KEY_PARTS = 3;

export interface PasswordQuality {
    code: 'TOO_SHORT' | 'OK';
    msg: string;
};

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

export const encrypt = async (
    key: CryptoKey,
    data: Uint8Array<ArrayBuffer>,
    iv: Uint8Array<ArrayBuffer>): Promise<string> => {    
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, data));
    const text = encrypted.slice(0, encrypted.length - 16);
    const authTag = encrypted.slice(encrypted.length - 16);
    return encodeBytes(iv, text, authTag);
}

export const decrypt = async (key: CryptoKey, data: string): Promise<ArrayBuffer> => {
    const { iv, text, authTag } = parseStoredCiphertext(data);
    
    const ctxt = new Uint8Array(text.length + authTag.length);
    ctxt.set(text, 0);
    ctxt.set(authTag, text.length)

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv, tagLength: 128 },
        key,
        ctxt
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

export const getMasterPasswordHash = async (masterKey: Uint8Array, password: string): Promise<string> => {
    const masterHashResult = await argon2id({
        password: masterKey,
        salt: password,
        hashLength: 32,
        iterations: 3,
        memorySize: 65536,
        parallelism: 4,
        outputType: "binary"
    });
    return uint8ArrayToB64(masterHashResult);
};

export const genSymmetricKey = () : Uint8Array<ArrayBuffer> => {
    return crypto.getRandomValues(new Uint8Array(32));
}

export const getUserKey = async (key: CryptoKey, encryptedKey: string): Promise<CryptoKey> => {
    const symmetricKey = new Uint8Array(await decrypt(key, encryptedKey));
    return getCryptoKey(symmetricKey);
}

export const parseStoredCiphertext = (encoded: string) : {
    iv: Uint8Array<ArrayBuffer>,
    text: Uint8Array<ArrayBuffer>,
    authTag: Uint8Array<ArrayBuffer>
} => {
    const parts = encoded.split('|');
    if (parts.length != ENCRYPTED_KEY_PARTS) {
        throw new Error("Invalid data");
    }
    const iv = b64ToUint8Array(parts[0]);
    const text = b64ToUint8Array(parts[1]);
    const authTag = b64ToUint8Array(parts[2]);
    return { iv, text, authTag };
}

const encodeBytes = (...values: Uint8Array[]): string => {
    const b64 = values.map(value => uint8ArrayToB64(value));
    return b64.join('|');
}

export const getCryptoKey = async (key: BufferSource): Promise<CryptoKey> => {
    return crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
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
'use client'
import * as keys from '@/lib/auth/client/password.client';
import Login from "../login";
import { signUp } from '../actions';
import { useContext } from 'react';
import { KeyContext } from '@/components/key-provider';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const { setKeys } = useContext(KeyContext);
    const router = useRouter();
    const handleSignUp = async (email: string, password: string) => {
        const masterKey = await keys.getMasterKey(email, password);
        const mpHash = await keys.getMasterPasswordHash(masterKey, password);
        const stretched = keys.getStretchedMasterKey(masterKey);
        const symmetricKey = keys.genSymmetricKey();
        const encodedKeys = keys.createEncodedProtectedKey(stretched, symmetricKey);
    
        const res = await signUp(email, mpHash, encodedKeys);
        if (res.success) {
            const ck = await keys.getEncryptionCryptoKey(symmetricKey.subarray(0, 32));
            const hk = await keys.getHmacCryptoKey(symmetricKey.subarray(32));
            setKeys({
                encryptionKey: ck,
                authKey: hk,
            });
            
            router.push('/vault');
            return '';
        }
        return res.error;
    }
    return <Login mode='signup' handleLogin={handleSignUp}/>;
}
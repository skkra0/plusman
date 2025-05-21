'use client'
import * as keys from '@/lib/auth/client/password.client';
import Login from "../login";
import { signUp } from '../actions';
import { useContext } from 'react';
import { KeyContext } from '@/components/key-provider';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const { setKey } = useContext(KeyContext);
    const router = useRouter();
    const handleSignUp = async (email: string, password: string) => {
        const masterKey = await keys.getMasterKey(email, password);
        const mpHash = await keys.getMasterPasswordHash(masterKey, password);
        const stretched = keys.getStretchedMasterKey(masterKey);
        const symmetricKey = keys.genSymmetricKey();
        const [psKey, hmac] = keys.createProtectedSymmetricKey(stretched, symmetricKey);
    
        const res = await signUp(email, mpHash, psKey, hmac);
        if (res.success) {
            const ck = await crypto.subtle.importKey('raw', symmetricKey.subarray(0, 32), 'AES-CBC', false, ['encrypt', 'decrypt']);
            setKey(ck);
            router.push('/vault');

            return '';
        }
        return res.error;
    }
    return <Login mode='signup' handleLogin={handleSignUp}/>;
}
'use client'
import * as pass from '@/lib/auth/client/password.client';
import Login from "../login";
import { signUp } from '../actions';
import { useContext } from 'react';
import { KeyContext } from '@/components/key-provider';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const { setKey } = useContext(KeyContext);
    const router = useRouter();
    const handleSignUp = async (email: string, password: string) => {
        const masterKey = await pass.getMasterKey(email, password);
        const mpHash = await pass.getMasterPasswordHash(masterKey, password);
        const symmetricKey = pass.genSymmetricKey();
        const encrypted = await pass.encrypt(await pass.getCryptoKey(masterKey), symmetricKey, crypto.getRandomValues(new Uint8Array(12)));
    
        const res = await signUp(email, mpHash, encrypted);
        if (res.success) {
            setKey(await pass.getCryptoKey(symmetricKey));
            router.push('/vault');
            return '';
        }
        return res.error;
    }
    return <Login mode='signup' handleLogin={handleSignUp}/>;
}
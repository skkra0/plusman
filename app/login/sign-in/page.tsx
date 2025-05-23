'use client'
import * as keys from '@/lib/auth/client/password.client'
import Login from "../login";
import { signIn } from '../actions';
import { KeyContext } from '@/components/key-provider';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const { setKeys } = useContext(KeyContext);
    const router = useRouter();
    const handleSignIn = async (email: string, password: string) => {
        const masterKey = await keys.getMasterKey(email, password);
        const mpHash = await keys.getMasterPasswordHash(masterKey, password);
        const stretched = keys.getStretchedMasterKey(masterKey);
    
        const res = await signIn(email, mpHash);
        if (res.success) {
            
            const userKeys = await keys.getUserKeys(stretched, res.key);

            setKeys(userKeys);
            
            router.push('/vault');
            
            return '';
        }
        return res.error;
    }

    return <Login mode='signin' handleLogin={handleSignIn}/>;
}
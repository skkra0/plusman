'use client'
import * as keys from '@/lib/auth/client/password.client'
import Login from "../login";
import { signIn } from '../actions';
import { KeyContext } from '@/components/key-provider';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const { setKey } = useContext(KeyContext);
    const router = useRouter();
    const handleSignIn = async (email: string, password: string) => {
        const masterKey = await keys.getMasterKey(email, password);
        const mpHash = await keys.getMasterPasswordHash(masterKey, password);
        const stretched = keys.getStretchedMasterKey(masterKey);
    
        const res = await signIn(email, mpHash);
        if (res.success) {
            
            const symmetricKey = keys.decryptSymmetricKey(stretched.subarray(0, 32), res.protectedSymmetricKey);
            const hmac = keys.getHmac(stretched.subarray(32), symmetricKey).toString('base64');
            if (hmac != res.hmac) {
                throw new Error("Invalid symmetric key.")
            }
            const ck = await crypto.subtle.importKey('raw', symmetricKey.subarray(0, 32), {name: 'AES-CBC'} , false, ['encrypt', 'decrypt']);
            console.log(ck);
            setKey(ck); 
            router.push('/vault');
            
            return '';
        }
        return res.error;
    }

    return <Login mode='signin' handleLogin={handleSignIn}/>;
}
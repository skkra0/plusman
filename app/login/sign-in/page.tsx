'use client'
import * as util from '@/lib/auth/client/password.client'
import Login from "../login";
import { signIn } from '../actions';
import { KeyContext } from '@/components/key-provider';
import { useContext } from 'react';

export default function SignInPage() {
    const { keys, setKeys } = useContext(KeyContext);
    const handleSignIn = async (email: string, password: string) => {
        const masterKey = await util.getMasterKey(email, password);
        const mpHash = await util.getMasterPasswordHash(masterKey, password);
        const res = await signIn(email, mpHash);
        if (res.success) {
            const stretched = await util.getStretchedMasterKey(masterKey);
            const userKeys = await util.getUserKeys(stretched, res.key);
            setKeys(userKeys);
            return '';
        }
        return res.error;
    }

    return <Login mode='signin' handleLogin={handleSignIn}/>;
}
'use client'

import Button from '@/components/button';
import Input from '@/components/input';
import { getMasterKey, getProtectedSymmetricKey, getStretchedMasterKey, validatePassword, getMasterPasswordHash } from '@/lib/auth/client/password.client';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { openSans } from '@/lib/fonts';
import { signIn, signUp } from './actions';
import { useRouter } from 'next/navigation';

export default function Login({ mode = 'signin' } : { mode?: 'signin' | 'signup'}) {
    const [emailState, setEmailState] = useState({
        text: "",
        error: ""
    });

    const [passwordState, setPasswordState] = useState({
        text: "",
        error: ""
    });

    const [err, setErr] = useState("");

    const router = useRouter();

    const onChangeEmail = useCallback( (e: ChangeEvent<HTMLInputElement>) => {
        const re = /^\S+@\S+\.\S+$/;
        const email = e.target.value.trim();
        let error = "";
        if (!re.test(email)) {
            error = "Please enter a valid email address."
        }
        setEmailState({
            text: email,
            error,
        });
    }, []);

    const onChangePassword = useCallback( (e: ChangeEvent<HTMLInputElement>) => {
        const pwQuality = validatePassword(e.target.value);
        let error = "";
        if (pwQuality.code != 'OK') {
            error = pwQuality.msg;
        }

        setPasswordState({
            text: e.target.value,
            error,
        });
    }, []);

    const action = mode == 'signin' ? useCallback(async (email: string, password: string) => {
        const masterKey = await getMasterKey(email, password);
        const mpHash = await getMasterPasswordHash(masterKey, password);
        const res = await signIn(email, mpHash);
        return res;
    }, []) : useCallback(async (email: string, password: string) => {
        const masterKey = await getMasterKey(email, password);
        const mpHash = await getMasterPasswordHash(masterKey, password);
        const stretched = getStretchedMasterKey(masterKey);
        const protectedSymmetricKey = await getProtectedSymmetricKey(stretched);
        const res = await signUp(email, mpHash, protectedSymmetricKey);
        return res;
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!emailState.text) {
            console.log(emailState)
            setEmailState(s => ({...s, error: "Please enter a valid email address."}));
            return;
        }

        if (!passwordState.text) {
            setPasswordState(s => ({...s, error: "Please enter a password."}));
            return;
        }

        if (emailState.error || passwordState.error) {
            return;
        }

        try {
            const res = await action(emailState.text, passwordState.text);
            if (!res.success) {
                setErr(res.error);
            } else {
                router.push("/vault");
            }
        } catch (e) {
            console.log((e as Error).message)
        }
    }
    return (<div className="h-screen flex flex-col justify-center items-center bg-neutral-1 bg-login">
            <div className="z-10 w-3/4 lg:w-1/3 min-h-1/2 bg-neutral-1 border-main-4 border rounded-2xl flex justify-center items-center">
                <div className="flex flex-col justify-around items-center w-3/4">
                    <h1 className={`${openSans.className} font-bold text-3xl text-main-5 mb-5`}>
                        { mode == 'signin' ? "Sign In" : "Sign Up" }
                    </h1>
                    <form className="space-y-5 w-full" onSubmit={handleSubmit}>
                        <Input
                        placeholder="email@example.com"
                        label="Email"
                        value={emailState.text}
                        error={emailState.error}
                        onChange={onChangeEmail}
                        required/>
                        <Input
                        type="password"
                        placeholder="Master password"
                        label="Master password"
                        value={passwordState.text}
                        error={passwordState.error}
                        onChange={onChangePassword}
                        required/>
                        <div className="h-1">
                            <p className="text-center text-error-3 p-0 m-0">{err}</p>
                        </div>
                        <Button type='submit' level='main'>Submit</Button>
                        <a href={mode == 'signin' ? "/sign-up" : "/sign-in"}>
                            <Button level='secondary' type='button'>
                                { mode == 'signin' ? 'Create an account instead' : 'Sign into existing account instead' }
                            </Button>
                        </a>
                    </form>
                </div>
            </div>
        </div>);
}
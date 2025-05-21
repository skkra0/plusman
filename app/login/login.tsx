'use client'

import Button from '@/components/button';
import Input from '@/components/input';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { openSans } from '@/lib/fonts';
import { validatePassword } from '@/lib/auth/client/password.client';
import classNames from 'classnames';

interface LoginState {
    email: string,
    pw: string,
    emailErr: string,
    pwErr: string,
    serverErr: string,
};

export default function Login({ mode = 'signin', handleLogin } : { 
    mode: 'signin' | 'signup',
    handleLogin: (email: string, pw: string) => Promise<string>,
}) {    
    const [loginState, setLoginState] = useState<LoginState>({
        email: "",
        pw: "",
        emailErr: "",
        pwErr: "",
        serverErr: ""
    });

    const onChangeEmail = useCallback( (e: ChangeEvent<HTMLInputElement>) => {
        const re = /^\S+@\S+\.\S+$/;
        const email = e.target.value.trim();
        let emailErr = "";
        if (!re.test(email)) {
            emailErr = "Please enter a valid email address."
        }
        setLoginState(s => ({ ...s, email, emailErr }));
    }, []);

    const onChangePassword = useCallback( (e: ChangeEvent<HTMLInputElement>) => {
        const pwQuality = validatePassword(e.target.value);
        let pwErr = "";
        if (pwQuality.code != 'OK') {
            pwErr = pwQuality.msg;
        }

        setLoginState(s => ({ ...s, pw: e.target.value, pwErr }));
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!loginState.email) {
            setLoginState(s => ({...s, emailErr: "Please enter a valid email address."}));
            return;
        }

        if (!loginState.pw) {
            setLoginState(s => ({...s, pwErr: "Please enter a password."}));
            return;
        }

        if (loginState.emailErr || loginState.pwErr) {
            return;
        }

        const { email, pw } = loginState;
        const res = await handleLogin(email, pw);
        setLoginState(s => ({...s, serverErr: res}));
    }

    return (<div className="h-screen flex flex-col justify-center items-center bg-neutral-1 bg-login">
            <div className="z-10 w-3/4 lg:w-1/3 min-h-1/2 bg-neutral-1 rounded-2xl shadow-lg shadow-neutral-3 flex justify-center items-center">
                <div className="flex flex-col justify-around items-center w-3/4">
                    <h1 className={classNames(openSans.className, "font-bold text-3xl text-main-5 mb-5")}>
                        { mode == 'signin' ? "Sign In" : "Sign Up" }
                    </h1>
                    <form className="space-y-5 w-full" onSubmit={handleSubmit}>
                        <Input
                        placeholder="email@example.com"
                        label="Email"
                        value={loginState.email}
                        error={loginState.emailErr}
                        onChange={onChangeEmail}
                        />
                        <Input
                        type="password"
                        placeholder="Master password"
                        label="Master password"
                        value={loginState.pw}
                        error={loginState.pwErr}
                        onChange={onChangePassword}
                        />
                        <div className="h-1">
                            <p className="text-error-3 p-0 m-0">{loginState.serverErr}</p>
                        </div>
                        <Button type='submit' level='main'>Submit</Button>
                        <a href={mode == 'signin' ? "/login/sign-up" : "/login/sign-in"}>
                            <Button level='secondary' type='button'>
                                { mode == 'signin' ? 'Create an account instead' : 'Sign into existing account instead' }
                            </Button>
                        </a>
                    </form>
                </div>
            </div>
        </div>);
}
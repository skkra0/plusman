'use client'
import { clearSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

export type KeyContextType = {
    key: CryptoKey | null,
    hmacKey: CryptoKey | null,
    setKey: Dispatch<SetStateAction<CryptoKey | null>>,
    setHmacKey: Dispatch<SetStateAction<CryptoKey | null>>,
};

export const KeyContext = createContext<KeyContextType>({
    key: null,
    hmacKey: null,
    setKey: () => {},
    setHmacKey: () => {}
});

export default function KeyProvider({ children } : { children: ReactNode }) {
    const [key, setKey] = useState<CryptoKey | null>(null);
    const [hmacKey, setHmacKey] = useState<CryptoKey | null>(null);
    const router = useRouter();
    useEffect(() => {
        if (!key && !hmacKey) {
            clearSession();
            router.push('/login/sign-in');
        }
    }, [key, hmacKey]);
    return <KeyContext.Provider value={{key, setKey, hmacKey, setHmacKey}}>
        {children}
    </KeyContext.Provider>
}
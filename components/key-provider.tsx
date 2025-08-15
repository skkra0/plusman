'use client'
import { clearSession } from "@/lib/auth/session";
import { usePathname, useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";


export const KeyContext = createContext<{
    key: CryptoKey | null,
    setKey: Dispatch<SetStateAction<CryptoKey | null>>,
}>({
    key: null,
    setKey: () => {},
});

const PROTECTED_PATHS = ['/vault'];

export default function KeyProvider({ children } : { children: ReactNode }) {
    const [key, setKey] = useState<CryptoKey | null>(null);
    const router = useRouter();
    const path = usePathname();
    useEffect(() => {
        if (!key) {
            const isProtected = PROTECTED_PATHS.some( prefix => prefix === path || path.startsWith(prefix + '/') );
            if (isProtected) {
                (async () => {
                    await clearSession();
                    router.push('/login/sign-in');
                })();
            }
        }
    }, [key, router, path]);
    return <KeyContext.Provider value={{key, setKey}}>
        {children}
    </KeyContext.Provider>
}
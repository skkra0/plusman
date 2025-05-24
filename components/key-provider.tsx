'use client'
import { DoubleCryptoKey } from "@/lib/auth/client/password.client";
import { clearSession } from "@/lib/auth/session";
import { usePathname, useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

export type KeyContextType = {
    keys: DoubleCryptoKey | null,
    setKeys: Dispatch<SetStateAction<DoubleCryptoKey | null>>,
};

export const KeyContext = createContext<KeyContextType>({
    keys: null,
    setKeys: () => {},
});

const PROTECTED_PATHS = ['/vault'];

export default function KeyProvider({ children } : { children: ReactNode }) {
    const [keys, setKeys] = useState<DoubleCryptoKey | null>(null);
    const router = useRouter();
    const path = usePathname();
    useEffect(() => {
        if (!keys) {
            const isProtected = PROTECTED_PATHS.some( prefix => prefix === path || path.startsWith(prefix + '/') );
            if (isProtected) {
                (async () => {
                    await clearSession();
                    router.push('/login/sign-in');
                })();
            }
        }
    }, [keys, router, path]);
    return <KeyContext.Provider value={{keys, setKeys}}>
        {children}
    </KeyContext.Provider>
}
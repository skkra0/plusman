'use client'
import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

export type KeyContextType = {
    key: CryptoKey | null,
    setKey: Dispatch<SetStateAction<CryptoKey | null>>,
};

export const KeyContext = createContext<KeyContextType>({
    key: null,
    setKey: () => {}
});

export default function KeyProvider({ children } : { children: ReactNode }) {
    const [key, setKey] = useState<CryptoKey | null>(null);
    return <KeyContext.Provider value={{key, setKey}}>
        {children}
    </KeyContext.Provider>
}
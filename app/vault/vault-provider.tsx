'use client'
import { Item } from '@/lib/db/schema';
import { createContext, Dispatch, SetStateAction, useState } from 'react';

type VaultContextType = {
    vault: Item[] | null,
    setVault: Dispatch<SetStateAction<Item[] | null>>,
}
export const VaultContext = createContext<VaultContextType>({ vault: [], setVault: () => {}});
export default function VaultProvider({ initialItems, children } : { initialItems?: Item[], children: React.ReactNode }) {
    const [vault, setVault] = useState<Item[] | null>(initialItems || null);
    return <VaultContext.Provider value={{ vault, setVault }}>
        {children}
    </VaultContext.Provider>
}
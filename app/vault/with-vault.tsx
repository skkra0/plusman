import { fetchItems } from "./actions";
import VaultProvider from "./vault-provider";

export default async function WithVault({ children } : { children: React.ReactNode }) {
    const res = await fetchItems();
    return <VaultProvider initialItems={res.success ? res.items : undefined}>
        {children}
    </VaultProvider>
}
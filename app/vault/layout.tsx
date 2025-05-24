import WithAuth from "@/components/with-auth";
import WithVault from "./with-vault";

export default async function VaultLayout({ children } : { children: React.ReactNode }) {
    return <WithAuth>
        <WithVault>
            {children}
        </WithVault>
    </WithAuth>
}
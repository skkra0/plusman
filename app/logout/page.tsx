'use client'

import { KeyContext } from "@/components/key-provider"
import { clearSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react"

export default function LogOut() {
    const { setKeys } = useContext(KeyContext);
    const router = useRouter();
    useEffect(() => {
        const logout = async () => {
            setKeys(null);
            await clearSession();
            router.push('/login/sign-in');
        }

        logout();
    }, [setKeys, router]);

    return null;
}
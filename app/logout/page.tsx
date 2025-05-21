'use client'

import { KeyContext } from "@/components/key-provider"
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react"

export default function LogOut() {
    const { setKey } = useContext(KeyContext);
    const router = useRouter();
    useEffect(() => {
        setKey(null);
        router.push("/login/sign-in");
    }, [setKey, router]);

    return null;
}
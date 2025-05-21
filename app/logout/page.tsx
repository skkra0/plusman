'use client'

import { KeyContext } from "@/components/key-provider"
import { redirect } from "next/navigation";
import { useContext } from "react"

export default function LogOut() {
    const { setKey } = useContext(KeyContext);
    setKey(null);
    redirect('/login/sign-in');
}
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginLayout({ children } : { children: React.ReactNode}) {
    if (await getSession()) {
        redirect('/vault');
    }

    return children;
}
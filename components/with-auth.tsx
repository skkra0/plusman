import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function WithAuth ({children} : { children: ReactNode }){
    const session = await getSession();
    if (!session) {
        redirect('/logout');
    }
    return children;
};
import Button from '@/components/button';
import Input from '@/components/input';
import { openSans } from '@/lib/fonts';

export default function Login({ mode = 'signin' } : { mode?: 'signin' | 'signup'}) {
    const formAction = "";
    return (<div className="h-screen flex flex-col justify-center items-center bg-neutral-1 bg-login">
            <div className="z-10 w-3/4 md:w-1/3 h-1/2 bg-neutral-1 border-main-4 border rounded-2xl flex justify-center items-center">
                <div className="flex flex-col justify-around items-center w-3/4">
                    <h1 className={`${openSans.className} font-bold text-3xl text-main-5 mb-5`}>
                        { mode == 'signin' ? "Sign In" : "Sign Up" }
                    </h1>
                    <form className="space-y-6" action={formAction}>
                        <Input placeholder="Email"/>
                        <Input placeholder="Master password"/>
                        <Button type='submit' level='main'>Submit</Button>
                        <Button level='secondary'>
                            { mode == 'signin' ? 'Create an account instead' : 'Sign into existing account instead' }
                        </Button>
                    </form>
                </div>
            </div>
        </div>);
}
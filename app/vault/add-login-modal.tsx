import Button from "@/components/button"
import Input from "@/components/input"
import { openSans } from "@/lib/fonts"
import classNames from "classnames"

export default function AddLoginModal() {
    return <>
        <div className="bg-neutral-3 opacity-50 min-w-screen min-h-screen"></div>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start sm:justify-center">
            <div className="w-3/4 lg:w-1/2 h-3/4 bg-neutral-1-5 rounded-2xl shadow-2xl flex flex-col">
                <div className="rounded-t-2xl border-b border-neutral-2 bg-neutral-1 min-h-1/12 p-3 pl-8 pr-4">
                    <h2 className={classNames("text-xl text-neutral-5 opacity-100 inline-block align-center", openSans.className)}>New Login</h2>
                    <button className="w-8 h-8 p-2 float-right cursor-pointer align-center hover:bg-neutral-1-5">
                        <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        fill="currentColor"
                        className="w-full text-neutral-4"
                        >
                        {/* Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                        </svg>
                    </button>
                </div>
                <div className="w-full h-5/6 p-8 space-y-4 overflow-y-auto">
                    <div className="bg-neutral-1 rounded-lg p-5 border-b-2 border-b-neutral-2 shadow-sm">
                        <Input type='input' label='Item name' placeholder='Item name' labelClassName='text-neutral-3' />
                        <Input type='input' label='Website' placeholder='https://example.com' labelClassName='text-neutral-3' />
                    </div>
                    <div className="bg-neutral-1 rounded-lg p-5 border-b-2 border-b-neutral-2 shadow-sm">
                        <Input type='input' label='Username or email' placeholder='email@example.com' labelClassName='text-neutral-3' />
                        <Input type='password' label='Password' placeholder='Password' labelClassName='text-neutral-3' />
                    </div>
                    <div className="bg-neutral-1 rounded-lg p-5 border-b-2 border-b-neutral-2 shadow-sm">
                        <Input type='input' label='Note' placeholder='Note' labelClassName='text-neutral-3' />
                    </div>
                </div>
                <Button level='main' className="rounded-t-none min-h-1/12">Submit</Button>
            </div>
        </div>
    </>
}
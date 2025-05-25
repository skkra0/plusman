'use client'
import Button from "@/components/button"
import Input from "@/components/input"
import { KeyContext } from "@/components/key-provider"
import { encryptAndSign } from "@/lib/auth/client/password.client"
import { DataField, Item, NewItem } from "@/lib/db/schema"
import { openSans } from "@/lib/fonts"
import classNames from "classnames"
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { addItem, deleteItem, updateItem } from "./actions"
import { VaultContext } from "./vault-provider"
import PasswordInput from "@/components/password-input"
import generator from "generate-password-browser";
export interface ModalState {
    open: boolean,
    mode: 'new' | 'edit',
    item?: Item
};

export default function EditItemModal({ state, setState, className }: {
    state: ModalState,
    setState: Dispatch<SetStateAction<ModalState>>,
    className?: string,

}) {
    useEffect(() => {
        if (state.mode === 'edit') {
            setFormState({
                name: state.item?.name || "",
                url: state.item?.data.url || "",
                username: state.item?.data.username || "",
                password: state.item?.data.password || "",
                note: state.item?.data.note || ""
            });
        }
    }, [state]);

    const { keys } = useContext(KeyContext);
    const { setVault } = useContext(VaultContext);

    const [generatorOptions, setGeneratorOptions] = useState({
        length: 12,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
        strict: true,
    });
    const [formState, setFormState] = useState({
        name: "",
        url: "",
        username: "",
        password: "",
        note: ""
    });

    const [errorState, setErrorState] = useState({
        nameErr: ""
    });

    const close = () => {
        setState({
            open: false,
            mode: 'new',
        });
        setFormState({
            name: "",
            url: "",
            username: "",
            password: "",
            note: ""
        });
        setErrorState({ nameErr: "" });
    }

    const onChange = (field: string) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const update = {
                [field]: e.target.value,
            }

            setFormState(s => ({ ...s, ...update }));
        }
    }

    const handleDiscard = async () => {
        if (state.mode === 'new') {
            close();
        } else if (state.mode === 'edit') {
            const res = await deleteItem(state.item!);
            if (res.success) {
                setVault(v => v ? v.filter(it => it.id != state.item?.id) : v);
                close();
            } else {
                throw new Error(res.error);
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (errorState.nameErr) {
            return;
        }

        if (!formState.name.trim()) {
            setErrorState({ nameErr: "Name is required. "});
            return;
        }

        if (state.mode === 'new') {
            const newItem: NewItem = {
                name: formState.name,
                userId: -1,
                data: {}
            };

            const fields: DataField[] = ['url', 'username', 'password', 'note'];
            for (let field of fields) {
                if (field in formState && formState[field]) {
                    newItem.data[field] = await encryptAndSign(keys!, Buffer.from(formState[field]));
                }
            }
            const res = await addItem(newItem);
            if (res.success) {
                setVault(v => v ? [...v, res.item] : [res.item]);
                close();
            } else {
                throw new Error(res.error);
            }
        } else if (state.mode === 'edit') {
            const newItem: Item = {
                id: state.item!.id,
                userId: -1,
                createdAt: new Date(0),
                updatedAt: new Date(0),
                name: formState.name,
                data: {}
            };

            const fields: DataField[] = ['url', 'username', 'password', 'note'];
            for (let field of fields) {
                if (field in formState && formState[field]) {
                    newItem.data[field] = await encryptAndSign(keys!, Buffer.from(formState[field]));
                }
            }

            const res = await updateItem(newItem);
            if (res.success) {
                setVault(v => v!.map(it => it.id === state.item!.id ? res.item : it));
                close();
            } else {
                throw new Error(res.error);
            }
        }
    }

    return <div className={classNames(state.open ? "block" : "hidden", "absolute top-0 left-0", className)}>
        <div className="bg-neutral-3 opacity-50 min-w-screen min-h-screen"></div>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start sm:justify-center">
            <div className="w-3/4 lg:w-1/2 h-3/4 bg-neutral-1-5 rounded-2xl shadow-2xl flex flex-col relative">
                <div className="rounded-t-2xl border-b border-neutral-2 bg-neutral-1 min-h-1/12 p-3 pl-8 pr-4">
                    <h2 className={classNames("text-xl text-neutral-5 opacity-100 inline-block align-center", openSans.className)}>
                        {state.mode === 'new' ? "New Login" : "Edit Login"}
                    </h2>
                    <button
                        onClick={() => {
                            setFormState({ name: "", url: "", username: "", password: "", note: "" });
                            setErrorState({ nameErr: "" });
                            close();
                        }}
                        className="w-8 h-8 p-2 float-right cursor-pointer align-center hover:bg-neutral-1-5">
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
                <form className="w-full h-5/6 p-5 space-y-5 overflow-y-auto" onSubmit={handleSubmit}>
                    <div className="bg-neutral-1 rounded-lg p-5 border-b-2 border-b-neutral-2 shadow-sm">
                        <Input
                            type='input'
                            label='Item name (required)'
                            placeholder='Item name'
                            value={formState.name}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    setErrorState(s => ({ ...s, nameErr: "Name is required." }));
                                }
                            }}
                            onChange={onChange('name')}
                            error={errorState.nameErr}
                            labelClassName='text-neutral-3' />
                        <Input
                            type='input'
                            label='Website'
                            placeholder='https://example.com'
                            value={formState.url}
                            onChange={onChange('url')}
                            labelClassName='text-neutral-3' />
                    </div>
                    <div className="bg-neutral-1 rounded-lg p-5 border-b-2 border-b-neutral-2 shadow-sm">
                        <Input
                            type='input'
                            label='Username or email'
                            placeholder='email@example.com'
                            value={formState.username}
                            onChange={onChange('username')}
                            labelClassName='text-neutral-3' />
                        <div className="flex items-center justify-between">
                        <PasswordInput
                            label='Password'
                            placeholder='Password'
                            value={formState.password}
                            onChange={onChange('password')}
                            labelClassName='text-neutral-3 w-5/6 inline-block align-start' />
                            <Button
                                type='button'
                                level='accent'
                                className="text-md group hover:scale-105 transition"
                                onClick={() => setFormState(s => ({
                                    ...s,
                                    password: generator.generate(generatorOptions)
                                }))}
                                >
                                Generate
                            </Button>
                        </div>
                    </div>
                    <div className="bg-neutral-1 rounded-lg p-5 border-b-2 border-b-neutral-2 shadow-sm">
                        <Input
                            type='input'
                            label='Note'
                            placeholder='Note'
                            value={formState.note}
                            onChange={onChange('note')}
                            labelClassName='text-neutral-3' />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-main-4 rounded-b-lg p-2 flex justify-between">
                        <Button
                            level={state.mode === 'new' ? 'secondary-2' : 'danger'}
                            onClick={handleDiscard}
                            type='button'
                            className="h-full">
                            {state.mode === 'new' ? 'Discard' : 'Delete this item'}
                        </Button>
                        <Button level='main' type='submit' className="h-full hover:shadow-md">Submit</Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
}
'use client'
import Button from "@/components/button";
import { useContext, useState } from "react";
import EditItemModal, { ModalState } from "./edit-item-modal";
import ItemCard from "./item-card";
import { VaultContext } from "./vault-provider";
import { DataField, Item } from "@/lib/db/schema";
import { KeyContext } from "@/components/key-provider";
import { decrypt } from "@/lib/auth/client/password.client";

export default function Vault() {
    const [modalState, setModalState] = useState<ModalState>({
        open: false,
        mode: 'new',
    });

    const { key } = useContext(KeyContext);
    const { vault } = useContext(VaultContext);

    const onClickItem = (item: Item) => {
        return async () => {
            const decrypted = {
                ...item,
                data: {...item.data},
            };
            const fields: DataField[] = ['url', 'username', 'password', 'note'];
            const decoder = new TextDecoder('utf-8');
            for (let field of fields) {
                if (field in item.data && item.data[field]) {
                    const raw = await decrypt(key!, item.data[field]);
                    decrypted.data[field] = decoder.decode(raw);
                }
            }
            setModalState({
                open: true,
                mode: 'edit',
                item: decrypted,
            });
        }
    };

    return <>
        <div className="w-full min-h-screen bg-neutral-1">
            <header className="border-b border-main-2 min-h-1/12 p-2 pl-5 pr-8 flex justify-between items-end bg-header">
                <h1 className="text-4xl text-main-1 m-0">Vault</h1>
                <div className="flex items-end space-x-4">
                    <Button level='accent' className="inline-block mb-0 hover:scale-105 transition" onClick={() => setModalState(s => ({...s, open: true}))}>
                        New Login
                    </Button>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="inline-block w-10 h-10"
                    >
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M406.5 399.6C387.4 352.9 341.5 320 288 320l-64 0c-53.5 0-99.4 32.9-118.5 79.6C69.9 362.2 48 311.7 48 256C48 141.1 141.1 48 256 48s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3l64 0c38.8 0 71.2 27.6 78.5 64.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"/>
                        <title>Coming Soon</title>
                    </svg> 
                </div>
            </header>
            {/* <div className="h-1/12">
                    
            </div> */}
            <div className="w-full h-5/6 p-5">
                <div className="w-full h-fit grid grid-cols-2 md:grid-cols-3 gap-5 p-5">
                    {vault?.map(item => <ItemCard 
                        key={`item-card-${item.id}`}
                        name={item.name}
                        onClick={onClickItem(item)}
                        className="h-42"/>)}
                </div>
            </div>
        </div>
        <EditItemModal state={modalState} setState={setModalState} />
    </>
}

export const dynamic = "force-dynamic";
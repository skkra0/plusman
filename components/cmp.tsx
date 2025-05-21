'use client'
import { useContext } from "react";
import { KeyContext } from "./key-provider"

export default function Component() {
    const { key } = useContext(KeyContext);
    console.log(key);
    return <p>hello</p>;
}
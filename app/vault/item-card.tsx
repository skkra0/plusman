import { hind } from "@/lib/fonts";
import classNames from "classnames";

export default function ItemCard({ name, onClick, className } : { name: string, onClick: () => void, className?: string }) {
    return <div 
    className={classNames("rounded-lg border border-main-4 shadow-neutral-2 shadow-sm hover:shadow-md group cursor-pointer", className)}
    onClick={onClick}>
        <h3 className={classNames("font-semibold text-2xl text-main-5 group-hover:text-main-4 p-5", hind.className)}>{name}</h3>
    </div>
}
export default function Input({ className, type, ...props } : React.ComponentProps<"input">) {
    return <input
        type={type}
        className={`rounded-xl border border-neutral-3 p-1 pl-3 h-9 w-full hover:border-2 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-main-3 focus:border-main-3 ${className}`}
        {...props}
    />
}
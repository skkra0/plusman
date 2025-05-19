export default function Input({ className, type, label, error, ...props } : React.ComponentProps<"input"> & { label?: string, error?: string }) {
    return <div>
    <label>{label}
        <input
            type={type}
            className={`rounded-lg border border-neutral-3 text-md p-1 pl-3 mb-1 h-9 w-full hover:border-2 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-main-3 focus:border-main-3 ${className}`}
            {...props}
        />
    </label>
    <p className="absolute text-sm text-error-3">{error}</p>
    </div>
}
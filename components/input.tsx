import classNames from "classnames";

export default function Input({ className, labelClassName, type, label, error, ...props } : React.ComponentProps<"input"> & { label?: string, labelClassName?: string, error?: string }) {
    return <div>
    <label className={labelClassName}>{label}
        <input
            type={type}
            className={classNames(
                "rounded-lg border border-neutral-3 text-md p-1 pl-3 mb-1 h-9 w-full", 
                "hover:border-main-3 outline-none focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-main-3 focus:border-main-3",
                className)}
            {...props}
        />
    </label>
    <p className="absolute text-sm text-error-3">{error}</p>
    </div>
}
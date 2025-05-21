import classNames from "classnames";

const getButtonStyle = (level: string) => {
    if (level === 'main') {
        return "bg-main-3 hover:bg-main-4 text-neutral-1";
    } else if (level === 'secondary') {
        return "bg-neutral-1 border border-main-5 text-neutral-3 hover:bg-neutral-1-5"
    }
}
export default function Button({className, level, ...props} : React.ComponentProps<"button"> & { level: string }) {
    return <button
        className={classNames(
            "rounded-xl cursor-pointer p-2 pl-5 pr-5 text-center w-full",
            getButtonStyle(level),
            className)
        }
        {...props}
    />
}
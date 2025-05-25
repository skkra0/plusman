import classNames from "classnames";

const getButtonStyle = (level: string) => {
    if (level === 'main') {
        return "bg-main-3 text-neutral-1 hover:bg-main-2";
    } else if (level === 'secondary') {
        return "bg-neutral-1 border border-main-4 text-neutral-3 hover:bg-neutral-2"
    } else if (level === 'secondary-2') {
        return "bg-main-4 border border-main-1 text-main-1 hover:bg-main-5"
    } else if (level === 'danger') {
        return "bg-error-3 text-neutral-1 hover:bg-error-3-5 hover:text-white hover:ring-2 hover:ring-error-2"
    } else if (level === 'accent') {
        return "bg-accent-3 text-neutral-1 hover:bg-accent-2-5 hover:text-white hover:h-10"
    }
}
export default function Button({className, level, ...props} : React.ComponentProps<"button"> & { level: string }) {
    return <button
        className={classNames(
            "rounded-3xl cursor-pointer p-2 pl-5 pr-5 text-center",
            getButtonStyle(level),
            className)
        }
        {...props}
    />
}
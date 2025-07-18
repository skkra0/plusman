import { openSans } from "@/lib/fonts";
import classNames from "classnames";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/login/sign-in");
  return (
    <div className="bg-main-4 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <h1 className={classNames("text-8xl text-main-1", openSans.className)}>Use a password manager</h1>
        </div>
      </main>
    </div>
  );
}

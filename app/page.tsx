import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  if (await getSession()) {
    redirect('/vault');
  }
  return (
    <div className="bg-main-1 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          use a password manager
        </div>
      </main>
    </div>
  );
}

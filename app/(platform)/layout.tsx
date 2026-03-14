import { PlatformHeader } from "@/components/platform-header";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-8">
      <aside className="glass-nav hidden overflow-hidden rounded-3xl p-4 lg:fixed lg:left-[max(2rem,calc(50vw-40rem+2rem))] lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:w-[280px] lg:flex-col">
        <Link href="/" className="text-lg font-semibold text-white">
          Care Pulse
        </Link>
        <p className="mt-1 text-sm text-slate-300">Premium chronic care operating layer.</p>
        <div className="min-h-0 flex-1">
          <Sidebar />
        </div>
      </aside>
      <section className="relative min-w-0 space-y-6 lg:ml-[calc(280px+1.5rem)] lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
        <PlatformHeader />
        <div className="space-y-4">{children}</div>
      </section>
    </div>
  );
}

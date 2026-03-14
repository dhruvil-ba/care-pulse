import { PlatformHeader } from "@/components/platform-header";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl items-start gap-6 px-4 py-6 lg:h-screen lg:grid-cols-[280px_minmax(0,1fr)] lg:overflow-hidden lg:px-8">
      <aside className="glass-nav sticky top-4 hidden h-[calc(100vh-3rem)] rounded-3xl p-4 lg:flex lg:flex-col">
        <Link href="/" className="text-lg font-semibold text-white">
          Care Pulse
        </Link>
        <p className="mt-1 text-sm text-slate-300">Premium chronic care operating layer.</p>
        <Sidebar />
      </aside>
      <section className="relative min-w-0 space-y-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
        <PlatformHeader />
        <div className="space-y-4">{children}</div>
      </section>
    </div>
  );
}

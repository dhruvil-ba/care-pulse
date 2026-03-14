import type { Metadata } from "next";
import { Epilogue, Source_Sans_3 } from "next/font/google";
import { ToastProvider } from "@/components/ui/toaster";
import { MeBootstrap } from "@/components/me-bootstrap";
import "./globals.css";

const displayFont = Epilogue({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "800"]
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Care Pulse | Population Health Management MVP",
  description: "Chronic care coordination platform for ACOs and health systems."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${displayFont.variable} ${bodyFont.variable} font-[var(--font-body)]`}>
        <MeBootstrap />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

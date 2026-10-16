import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** The CRM has its own root layout — it's Romanian-only and outside /[lang]. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ro" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

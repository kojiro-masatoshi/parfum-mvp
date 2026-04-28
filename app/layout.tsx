import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_JP, Shippori_Mincho, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-shippori-mincho",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Parfum MVP — 香水レコメンド",
  description: "生活習慣と属性の診断から、あなたに相性のよい香水を提案します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${shipporiMincho.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-3xl px-6">
          <header className="flex items-center justify-between border-b rule py-5">
            <Link
              href="/"
              className="font-garamond text-lg tracking-[0.35em] text-neutral-800"
            >
              PARFUM
            </Link>
            <span className="font-garamond text-[10px] tracking-[0.4em] text-neutral-400">
              VOL. 01 · DIAGNOSIS
            </span>
          </header>
          <main className="py-10">{children}</main>
          <footer className="border-t rule py-6 text-center font-garamond text-[10px] tracking-[0.4em] text-neutral-400">
            — FIN —
          </footer>
        </div>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Find and remove duplicate rows, names, emails and phone numbers in Excel and CSV files, right in your browser.";

export const metadata: Metadata = {
  title: "Duplicate Identifier",
  description,
  applicationName: "Duplicate Identifier",
  authors: [{ name: "Vikram" }],
  creator: "Vikram",
  keywords: ["duplicate remover", "excel", "csv", "dedupe", "data cleaning"],
  openGraph: { title: "Duplicate Identifier", description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">{children}</body>
    </html>
  );
}

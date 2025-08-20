import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dharma",
  description: "Sneakerhead-native community app with hyperlocal feeds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
              <Link href="/" className="font-bold text-xl">Dharma</Link>
              <div>
                <Link href="/" className="mr-4 hover:text-gray-300">Feed</Link>
                <Link href="/releases" className="hover:text-gray-300">Releases</Link>
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}

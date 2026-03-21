import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${inter.className} bg-black text-neutral-400 antialiased h-screen overflow-hidden flex flex-col selection:bg-neutral-800 selection:text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

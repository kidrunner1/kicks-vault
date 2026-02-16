import type { Metadata } from "next";
import "./globals.css";

import { bebas, orbitron } from "./fonts";

export const metadata: Metadata = {
  title: "KicksVault",
  description: "Your trusted destination for premium sneakers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body
        className={`
          ${bebas.variable}
          ${orbitron.variable}
          font-[var(--font-orbitron)]
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}

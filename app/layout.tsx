import type { Metadata } from "next";
import "./globals.css";

import { prompt } from "./fonts";

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
          ${prompt.variable}
          font-(--font-orbitron)
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import ClientClerk from "./ClientClerk";
import "./globals.css";

export const metadata: Metadata = {
  title: "TareqsDrip - Email System",
  description: "Automated email system for TareqsDrip e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientClerk>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClientClerk>
  );
}

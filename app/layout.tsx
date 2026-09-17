import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Girlfriend",
  description: "Your personal AI companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#05010f",
          color: "#f5f3ff",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}

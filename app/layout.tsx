import type { Metadata, Viewport } from "next";
import "./globals.css";
import PINLockWrapper from "@/components/PINLockWrapper";

export const metadata: Metadata = {
  title: "AI Girlfriend",
  description: "Your personal AI companion",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI GF",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff2d95",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <PINLockWrapper>{children}</PINLockWrapper>
      </body>
    </html>
  );
}

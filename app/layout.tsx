import type { Metadata, Viewport } from "next";
import "./globals.css";
import PINLockWrapper from "@/components/PINLockWrapper";

export const metadata: Metadata = {
  title: "AI Girlfriend",
  description: "Your personal AI companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI GF",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#ff2d95" />
      </head>
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

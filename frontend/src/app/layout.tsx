import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Ubuntu_Mono } from "next/font/google";

import { Toaster } from "@/components/ui";
import "./globals.css";

const ubuntu_mono = Ubuntu_Mono({ 
  subsets: ["latin"],
  variable: "--font-ubuntu-mono",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: "Lumea",
  description: "Personalized study plans crafted to help you master skills efficiently and achieve your goals faster.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ubuntu_mono.className}>
        {children}
        <Toaster />
      </body>
      <GoogleAnalytics gaId={`${process.env.NEXT_PUBLIC_ANALYTICS_ID}`} />
    </html>
  );
}

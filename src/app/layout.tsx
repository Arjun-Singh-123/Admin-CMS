import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import AdminLayout from "@/components/layouts/admin-layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Providers from "./providers";
import ScrollToTop from "@/components/header/scroll-to-top";
import Simple from "@/components/header/simple";
import TopHeader from "@/components/header/top-header";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen antialiased  `}
      >
        <Providers>
          <AdminLayout>
            <main className="flex-grow">{children}</main>
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster richColors={true} duration={3000} position="top-right" />
          </AdminLayout>
        </Providers>
        <ScrollToTop />
      </body>
    </html>
  );
}

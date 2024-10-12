import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import AdminLayout from "@/components/layouts/admin-layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Providers from "./providers";
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
          <AdminLayout>
            {" "}
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster richColors={true} duration={3000} position="top-right" />
          </AdminLayout>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./context/AuthProvider";
import { SidebarProvider } from "./context/SidebarContext";
import Sidebar from "@/components/custom/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenPay",
  description: "No payments, just intent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="apple-touch-icon"
        href="/apple-icon.png"
        type="image/png"
        sizes="180x180"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <main>
            <AuthProvider>
                <SidebarProvider>
                  <Sidebar />
                  {children}
                </SidebarProvider>
            </AuthProvider>
            <Toaster richColors closeButton position="bottom-right" />
          </main>
      </body>
    </html>
  );
}

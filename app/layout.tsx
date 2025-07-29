import type { Metadata } from "next";
import { Dela_Gothic_One, Montserrat } from "next/font/google";
// import { AuthProvider } from "./context/AuthProvider";
// import { SidebarProvider } from "./context/SidebarContext";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dela_gothic_one = Dela_Gothic_One({
  variable: "--font-dela-gothic-one",
  subsets: ["latin"],
  weight: ["400"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
        className={`${dela_gothic_one.variable} ${montserrat.variable} antialiased`}
      >
        <main>
          {/* <AuthProvider> */}
          {/* <SidebarProvider> */}
          {children}
          {/* </SidebarProvider> */}
          {/* </AuthProvider> */}
          <Toaster richColors closeButton position="bottom-right" />
        </main>
      </body>
    </html>
  );
}

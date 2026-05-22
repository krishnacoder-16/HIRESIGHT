import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HIRESIGHT",
  description: "Premium Recruitment Intelligence",
};

import { ToastProvider } from "@/contexts/ToastContext";
import { DashboardProvider } from "@/contexts/DashboardContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FAF8F5]">
        <ToastProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

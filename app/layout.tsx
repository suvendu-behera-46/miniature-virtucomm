import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnimationRuntime } from "@/components/animation-runtime";
import { SeasonalThemeBackground } from "@/components/seasonal-theme-background";
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
  title: "Miniature Studio | Custom 3D Keepsakes",
  description: "Create custom 3D miniature family, couple, and pet keepsakes with a database-driven storefront and admin CMS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        <AnimationRuntime />
        <SeasonalThemeBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}

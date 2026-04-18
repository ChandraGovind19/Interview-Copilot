import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const heading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview Copilot",
  description:
    "Practice behavioral interviews with structured STAR feedback, coaching, and session tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${sans.variable} ${mono.variable} ${heading.variable} h-full`} suppressHydrationWarning>
        <body className="min-h-full bg-background font-sans text-foreground antialiased">
          <Script id="theme-init" strategy="beforeInteractive">
            {`
              try {
                var storedTheme = localStorage.getItem("theme");
                var theme = storedTheme === "dark" ? "dark" : "light";
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.dataset.theme = theme;
              } catch (error) {}
            `}
          </Script>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

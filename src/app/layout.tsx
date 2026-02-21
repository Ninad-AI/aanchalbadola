import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "aanchalbadola — Voice Chat",
  description:
    "Premium interactive voice chat experience with aanchalbadola. Start a live session now.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased noise-overlay`}>
        {children}
      </body>
    </html>
  );
}

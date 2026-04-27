import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Line Seafood — Fresh · Live · Frozen",
    template: "%s | The Line Seafood",
  },
  description:
    "Singapore's freshest seafood delivered to your door. Live, fresh, and frozen seafood sourced daily from trusted suppliers.",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/favicon.svg",
  },
  openGraph: {
    siteName: "The Line Seafood",
    locale: "en_SG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={plusJakartaSans.variable}
    >
      <body className="min-h-screen font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

import localFont from "next/font/local";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sifonn = localFont({
  src: "./fonts/SIFONN.otf",
  variable: "--font-sifonn",
});

export const metadata = {
  title: "Ezinix Customer Portal",
  description: "Track your B2B orders with Ezinix",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${sifonn.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6c63ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full font-sans">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

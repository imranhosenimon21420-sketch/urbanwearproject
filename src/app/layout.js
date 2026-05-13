import SiteHeader from "@/components/SiteHeader";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "UrbanWear",
  description: "Modern fashion eCommerce — fast, minimal, mobile-first.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <div className="uw-shell">
          <SiteHeader />
          <div className="uw-main">{children}</div>
        </div>
      </body>
    </html>
  );
}

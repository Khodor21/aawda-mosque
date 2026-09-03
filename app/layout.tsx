import type { Metadata } from "next";
import localFont from "next/font/local";
import "./global.css";

/* Local Thmanyah Serif fonts (files live in /public/fonts) */
const thmLight = localFont({
  src: "../public/fonts/ThmanyahSerif-Light.otf",
  weight: "300",
  variable: "--font-thm-light",
});

const thmMedium = localFont({
  src: "../public/fonts/ThmanyahSerif-Medium.otf",
  weight: "500",
  variable: "--font-thm-med",
});

const thmBold = localFont({
  src: "../public/fonts/ThmanyahSerif-Bold.otf",
  weight: "700",
  variable: "--font-thm-bold",
});

export const metadata: Metadata = {
  title: "مسجد  العودة - البداوي | شاشة المواقيت",
  description: "لوحة مواقيت الصلاة الرقمية لشاشات المسجد",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${thmLight.variable} ${thmMedium.variable} ${thmBold.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

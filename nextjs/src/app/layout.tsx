import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  title: "Zelis Product Operating System",
  description:
    "Price Optimization Business Unit — Product Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={nunitoSans.className}
        style={{ fontFamily: "'Avenir LT Pro', 'Avenir Next', 'Avenir', 'Nunito Sans', sans-serif" }}
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

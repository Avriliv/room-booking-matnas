import type { Metadata } from "next";
import { Inter, Heebo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = 'force-dynamic'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
});

export const metadata: Metadata = {
  title: "המחלקה לחינוך בלתי פורמלי - מטה אשר",
  description: "מערכת הזמנת חללי עבודה פנימית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${inter.variable} ${heebo.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
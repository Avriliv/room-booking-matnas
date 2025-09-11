import type { Metadata } from "next";
import { Inter, Heebo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

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
  title: "הזמנת חללי עבודה - המחלקה לחינוך בלתי פורמלי מטה אשר",
  description: "מערכת הזמנת חללי עבודה פנימית - המחלקה לחינוך בלתי פורמלי מטה אשר",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${heebo.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
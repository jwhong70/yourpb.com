import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOURPB.COM - ETF 포트폴리오 자산관리 파트너",
  description: "당신의 PB는 누구입니까? 최적의 ETF 포트폴리오 솔루션 YOURPB",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

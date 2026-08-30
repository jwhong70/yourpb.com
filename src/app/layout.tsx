import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yourpb.vercel.app"),
  title: "당신의 피비 - ETF 포트폴리오 자산관리 파트너",
  description: "각종 지표, ETF, 주식 분석을 한 곳에서 확인하세요",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "당신의 피비",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "당신의 피비",
    description: "각종 지표, ETF, 주식 분석을 한 곳에서 확인하세요",
    url: "https://yourpb.vercel.app",
    siteName: "당신의 피비",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "당신의 피비 로고",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`h-full antialiased ${pretendard.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

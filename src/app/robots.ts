import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/mypage/",
          "/auth/",
          "/actions/",
        ],
      },
      {
        // 주요 AI 검색 및 LLM 크롤러 명시적 허용
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Yeti", // Naver
          "Applebot",
          "PerplexityBot",
          "GPTBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: [
          "/",
          "/etf",
          "/stock",
          "/macro",
          "/monthly",
          "/learning",
          "/about",
          "/diagnosis",
        ],
        disallow: [
          "/api/",
          "/mypage/",
          "/auth/",
          "/actions/",
        ],
      },
      {
        // 무분별한 스크래핑 및 리소스 낭비 봇 차단
        userAgent: [
          "Bytespider",
          "CCBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://yourpb.vercel.app/sitemap.xml",
  };
}


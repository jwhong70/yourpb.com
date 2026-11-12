import type { MetadataRoute } from "next";

const BASE_URL = "https://yourpb.vercel.app";

// 자주 검색되고 인덱싱되어야 할 대표 핵심 글로벌 ETF (우리 DB 5대 자산군 기준)
const POPULAR_ETFS = [
  "SPY", "QQQ", "SOXX", "SMH", "TLT", "GLD", "XLE", "XLK", "XLF", "UVXY",
  "IWM", "ACWI", "URTH", "XLV", "XLI", "XLP", "XLU", "XLY", "XLC", "XLB",
  "SSO", "UPRO", "QLD", "TQQQ", "SHV", "BIL", "VGIT", "VTI", "VT", "VEA"
];

// 대표 글로벌 우량주
const POPULAR_STOCKS = [
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "BRK-B", "LLY", "AVGO",
  "JPM", "V", "UNH", "XOM", "MA", "PG", "JNJ", "HD", "COST", "MRK"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // 1. 핵심 정적 페이지
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/etf`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stock`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/macro`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/monthly`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/learning`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/diagnosis`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/subscribe`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 2. 대표 ETF 상세 페이지
  const etfRoutes: MetadataRoute.Sitemap = POPULAR_ETFS.map((ticker) => ({
    url: `${BASE_URL}/etf/${ticker}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // 3. 대표 개별주 상세 페이지
  const stockRoutes: MetadataRoute.Sitemap = POPULAR_STOCKS.map((ticker) => ({
    url: `${BASE_URL}/stock/${ticker}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...etfRoutes, ...stockRoutes];
}


import React from 'react';

export default function MacroLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <div className="h-16 border-b border-black/10 bg-white" />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-none" />
            <div className="h-4 w-96 bg-gray-100 animate-pulse rounded-none" />
          </div>

          {/* 대분류 탭 스켈레톤 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse border border-black/10" />
            ))}
          </div>

          {/* 매크로 지표 카드 그리드 스켈레톤 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-box-bg border border-black p-5 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

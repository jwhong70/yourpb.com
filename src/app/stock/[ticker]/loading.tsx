import React from 'react';

export default function StockDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <div className="h-16 border-b border-black/10 bg-white" />
      <main className="grow pt-20">
        <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 mt-10">
          {/* 상단 버튼 & 타이틀 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-32 bg-black animate-pulse rounded-none" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 animate-pulse" />
                <div className="h-6 w-28 bg-gray-200 animate-pulse" />
              </div>
              <div className="h-8 w-64 bg-gray-300 animate-pulse" />
            </div>
          </div>

          {/* 2단 그리드 스켈레톤 (기초정보, 개요) */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">
            <div className="h-72 bg-box-bg border border-black p-5 animate-pulse" />
            <div className="h-72 bg-box-bg border border-black p-5 animate-pulse" />
          </div>

          {/* 차트 2단 스켈레톤 */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-8">
            <div className="h-64 bg-box-bg border border-black animate-pulse" />
            <div className="h-64 bg-box-bg border border-black animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

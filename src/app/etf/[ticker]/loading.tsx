import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

export default function EtfDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans animate-pulse">
      <Header initialUser={null} />
      <main className="grow pt-20">
        <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 mt-10">
          
          {/* 상단 네비게이션 및 타이틀 스켈레톤 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-transparent font-bold">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
                <span>목록으로 복귀</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-gray-200 rounded-none" />
                <div className="h-6 w-24 bg-gray-100 rounded-none" />
              </div>
              <div className="h-8 w-64 bg-gray-300 rounded-none" />
            </div>
          </div>

          {/* 3단 그리드 스켈레톤 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-64 bg-box-bg border border-gray-200 p-5 space-y-3">
              <div className="h-4 w-28 bg-gray-200" />
              <div className="h-10 bg-gray-100" />
              <div className="h-10 bg-gray-100" />
              <div className="h-10 bg-gray-100" />
            </div>
            <div className="h-64 bg-box-bg border border-gray-200 p-5 space-y-3">
              <div className="h-4 w-32 bg-gray-200" />
              <div className="h-6 w-40 bg-gray-300" />
              <div className="h-20 bg-gray-100" />
            </div>
            <div className="h-64 bg-box-bg border border-gray-200 p-5 space-y-3">
              <div className="h-4 w-36 bg-gray-200" />
              <div className="h-6 w-32 bg-gray-300" />
              <div className="h-16 bg-gray-100" />
            </div>
          </div>

          {/* 차트 영역 스켈레톤 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-72 bg-box-bg border border-gray-200 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-400">ETF 데이터를 불러오는 중...</span>
            </div>
            <div className="h-72 bg-box-bg border border-gray-200 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-400">성과 지표를 불러오는 중...</span>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

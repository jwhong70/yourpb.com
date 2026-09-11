import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MacroLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans animate-pulse">
      <Header initialUser={null} />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-300 rounded-none" />
            <div className="h-4 w-96 bg-gray-200 rounded-none" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-12 bg-gray-200 rounded-none" />
            <div className="h-12 bg-gray-200 rounded-none" />
            <div className="h-12 bg-gray-200 rounded-none" />
            <div className="h-12 bg-gray-200 rounded-none" />
          </div>

          <div className="space-y-6">
            <div className="h-48 bg-box-bg border border-gray-200 p-6 flex flex-col justify-between">
              <div className="h-6 w-48 bg-gray-300" />
              <div className="h-24 bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-box-bg border border-gray-200 p-6 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-400">매크로 차트 데이터를 불러오는 중...</span>
              </div>
              <div className="h-64 bg-box-bg border border-gray-200 p-6 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-400">경기 지표를 불러오는 중...</span>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

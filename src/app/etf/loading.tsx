import React from 'react';

export default function EtfLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <div className="h-16 border-b border-black/10 bg-white" />
      <main className="grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-10">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-none" />
            <div className="h-12 w-full bg-gray-100 animate-pulse rounded-none border border-black/10" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-none border border-black/5" />
            ))}
          </div>

          <div className="space-y-3">
            <div className="h-12 w-full bg-gray-200 animate-pulse rounded-none" />
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-gray-50 animate-pulse rounded-none border-b border-gray-200" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

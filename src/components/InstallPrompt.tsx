"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. 이미 PWA로 실행 중인지 확인 (standalone 모드)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // 2. 7일 이내에 닫기를 눌렀는지 확인
    const dismissedTime = localStorage.getItem("yourpb_pwa_dismissed");
    if (dismissedTime) {
      const diffDays = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) return;
    }

    // 3. 기기 환경 감지 (iOS 여부)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. 안드로이드/크롬 PWA 설치 신호 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. 사용자가 웹사이트를 3초 이상 둘러본 뒤 하단에서 스르륵 노출
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // 아이폰 유저는 직관적인 그림 안내 모달 띄우기
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      // 안드로이드/갤럭시 유저는 브라우저 원클릭 설치 팝업 트리거
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("설치 팝업 실행 오류:", err);
      }
    } else {
      // 기타 브라우저는 간편 안내
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("yourpb_pwa_dismissed", Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 하단 스마트 슬라이드인 배너 */}
      <aside 
        aria-label="앱 설치 안내"
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500"
      >
        <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-xl">
          {/* 좌측 앱 아이콘 & 설명 */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-amber-500/50 shadow-md">
              <Image
                src="/icon-192x192.png"
                alt="당신의 피비 앱 아이콘"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">당신의 피비</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  앱으로 추가
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                홈 화면에서 매주 최신 비중을 1초 만에 확인!
              </p>
            </div>
          </div>

          {/* 우측 1초 설치 버튼 & 닫기 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstallClick}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-neutral-950 shadow-lg transition-transform active:scale-95 hover:brightness-110"
            >
              1초 설치
            </button>
            <button
              onClick={handleDismiss}
              aria-label="닫기"
              className="p-1 text-neutral-400 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* 아이폰(iOS) 5060 고객 전용 초간단 그림 안내 팝업 모달 */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-modal-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/40 bg-neutral-900 p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="ios-modal-title" className="text-lg font-bold text-amber-400">
                📲 스마트폰 바탕화면에 추가하기
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                aria-label="안내 팝업 닫기"
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mb-5 text-sm text-neutral-300 leading-relaxed">
              사파리(Safari) 브라우저에서 아래 2단계만 누르시면 스마트폰 첫 화면에 홍선생님 앱 아이콘이 생성됩니다:
            </p>

            <div className="space-y-3.5 rounded-2xl bg-neutral-950/80 p-4 border border-neutral-800 text-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                  1
                </span>
                <span className="leading-snug">
                  화면 맨 아래 <strong>[공유 버튼 ⎋]</strong> (네모에 위쪽 화살표) 터치
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                  2
                </span>
                <span className="leading-snug">
                  메뉴를 조금 올려 <strong>[홈 화면에 추가 ➕]</strong> 터치
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                  3
                </span>
                <span className="leading-snug">
                  우측 상단 <strong>[추가]</strong> 터치하면 설치 완료!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-neutral-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
}

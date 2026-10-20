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
  const [isKakao, setIsKakao] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 0. 클라이언트 환경 방어
    if (typeof window === "undefined") return;

    try {
      // 1. 이미 PWA 독립 앱(standalone)으로 실행 중인지 확인
      const isStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
      if (isStandalone) return;

      // 2. 7일 이내에 닫기를 눌렀는지 확인 (안전한 try-catch)
      const dismissedTime = localStorage.getItem("yourpb_pwa_dismissed");
      if (dismissedTime) {
        const diffDays = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
        if (diffDays < 7) return;
      }
    } catch {
      // localStorage 접근 불가 환경(카톡 시크릿/웹뷰 등) 예외 무시하고 계속 진행
    }

    const userAgent = (window.navigator?.userAgent || "").toLowerCase();
    
    // 3. 카카오톡 인앱 브라우저 감지
    const isKakaoTalk = userAgent.includes("kakaotalk");
    setIsKakao(isKakaoTalk);

    // 4. iOS (아이폰/아이패드) 감지
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 5. 안드로이드/크롬 PWA 설치 신호 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. 1.5초 후 자연스럽게 슬라이드업 노출 (즉각적 반응성)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    // A. 카카오톡 인앱 브라우저인 경우: 외부 브라우저(크롬/사파리)로 열기 안내
    if (isKakao) {
      const currentUrl = window.location.href;
      const userAgent = (window.navigator?.userAgent || "").toLowerCase();
      
      // 안드로이드 카톡: 크롬 브라우저로 원클릭 탈출 Intent 실행
      if (/android/.test(userAgent)) {
        window.location.href = `intent://${currentUrl.replace(/https?:\/\//i, "")}#Intent;scheme=https;package=com.android.chrome;end`;
        return;
      }
      
      // 아이폰 카톡: 사파리로 열기 모달 띄우기
      setShowIOSModal(true);
      return;
    }

    // B. 아이폰(iOS)인 경우: 돋보기 그림 안내 모달 띄우기
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // C. 안드로이드(삼성 갤럭시/크롬)인 경우: 네이티브 원클릭 설치 팝업 실행
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("설치 팝업 실패:", err);
        setShowIOSModal(true);
      }
    } else {
      // 신호가 아직 안 왔거나 미지원 브라우저: 돋보기 안내 모달 띄우기
      setShowIOSModal(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    try {
      localStorage.setItem("yourpb_pwa_dismissed", Date.now().toString());
    } catch {
      // 무시
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 화면 하단 럭셔리 골드 플로팅 설치 배너 */}
      <aside 
        aria-label="스마트폰 앱 설치 안내"
        className="fixed bottom-4 left-3 right-3 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500"
      >
        <div 
          onClick={handleInstallClick}
          className="relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-amber-500/50 bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-xl transition-all active:scale-[0.98] hover:border-amber-400"
        >
          {/* 좌측 공식 앱 아이콘 & 문구 */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-amber-500/60 shadow-md">
              <Image
                src="/icon-192x192.png"
                alt="당신의 피비 앱 아이콘"
                width={48}
                height={48}
                priority
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
              <p className="text-xs text-neutral-300">
                {isKakao 
                  ? "크롬/사파리로 열어 홈 화면에 추가하세요" 
                  : "홈 화면에서 매주 최신 비중을 1초 만에 확인!"}
              </p>
            </div>
          </div>

          {/* 우측 액션 버튼 & 닫기 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInstallClick();
              }}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-neutral-950 shadow-lg transition-transform active:scale-95 hover:brightness-110"
            >
              {isKakao ? "브라우저로 열기" : "1초 설치"}
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

      {/* 5060 고객 전용 돋보기 그림 가이드 모달 (아이폰 or 카카오톡 or 브라우저 공통) */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-4 backdrop-blur-md sm:items-center animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/50 bg-neutral-900 p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-400">
                {isKakao ? "💬 카카오톡 외부 브라우저 열기" : "📲 스마트폰 홈 화면에 추가하기"}
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                aria-label="닫기"
                className="text-neutral-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {isKakao ? (
              // 카카오톡 인앱 브라우저 전용 탈출 가이드
              <div className="space-y-4">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  카카오톡 안에서는 앱 설치가 제한됩니다. 아래 순서로 <strong>일반 브라우저(크롬/사파리)</strong>로 열어주세요:
                </p>
                <div className="space-y-3 rounded-2xl bg-neutral-950/90 p-4 border border-neutral-800 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      1
                    </span>
                    <span className="leading-snug">
                      화면 맨 우측 상단(또는 하단) <strong>[점 3개 ⋮]</strong> 터치
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      2
                    </span>
                    <span className="leading-snug">
                      <strong>[다른 브라우저로 열기]</strong> (크롬/사파리) 터치
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      3
                    </span>
                    <span className="leading-snug">
                      열린 화면에서 <strong>[1초 설치]</strong>를 누르면 끝!
                    </span>
                  </div>
                </div>
              </div>
            ) : isIOS ? (
              // 아이폰 사파리 전용 가이드
              <div className="space-y-4">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  사파리(Safari) 브라우저에서 아래 3단계만 누르시면 스마트폰 첫 화면에 홍선생님 앱 아이콘이 촥 박힙니다:
                </p>
                <div className="space-y-3 rounded-2xl bg-neutral-950/90 p-4 border border-neutral-800 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      1
                    </span>
                    <span className="leading-snug">
                      화면 맨 아래 <strong>[공유 버튼 ⎋]</strong> (네모에 화살표) 터치
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      2
                    </span>
                    <span className="leading-snug">
                      목록을 올려 <strong>[홈 화면에 추가 ➕]</strong> 터치
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
              </div>
            ) : (
              // 일반 안드로이드/기타 가이드
              <div className="space-y-4">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  브라우저 메뉴에서 홈 화면에 추가하실 수 있습니다:
                </p>
                <div className="space-y-3 rounded-2xl bg-neutral-950/90 p-4 border border-neutral-800 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      1
                    </span>
                    <span className="leading-snug">
                      브라우저 우측 상단 <strong>[점 3개 ⋮]</strong> 터치
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950">
                      2
                    </span>
                    <span className="leading-snug">
                      <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong> 터치
                    </span>
                  </div>
                </div>
              </div>
            )}

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

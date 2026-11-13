'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
  Maximize2,
  X,
  Volume2
} from 'lucide-react';
import { LEARNING_EPISODES, LEARNING_CHAPTERS, LearningEpisode } from '@/lib/learningData';

interface LearningHubClientProps {
  initialUser: {
    id: string;
    email: string | null;
    name: string;
    membership_status: string;
  } | null;
}

export default function LearningHubClient({ initialUser }: LearningHubClientProps) {
  const searchParams = useSearchParams();
  const epParam = searchParams.get('ep');

  // 현재 선택된 에피소드
  const [selectedEp, setSelectedEp] = useState<LearningEpisode>(() => {
    if (epParam) {
      const found = LEARNING_EPISODES.find((e) => e.episodeNumber === parseInt(epParam, 10));
      if (found) return found;
    }
    return LEARNING_EPISODES[0];
  });

  // 카드뉴스 현재 인덱스 (1 ~ 10)
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'video'>('cards');
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [openChapterId, setOpenChapterId] = useState<number>(selectedEp.chapterNumber);
  const [completedEps, setCompletedEps] = useState<number[]>([]);
  const [copiedAlert, setCopiedAlert] = useState(false);

  // 로컬스토리지에서 완료된 에피소드 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yourpb_completed_episodes');
      if (saved) {
        setCompletedEps(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // URL 쿼리 파라미터(?ep=3) 변경 실시간 감지 및 동기화
  useEffect(() => {
    const ep = searchParams.get('ep');
    if (ep) {
      const targetEpNum = parseInt(ep, 10);
      const found = LEARNING_EPISODES.find((e) => e.episodeNumber === targetEpNum);
      if (found && found.id !== selectedEp.id) {
        setSelectedEp(found);
        setCurrentCardIndex(1);
        setOpenChapterId(found.chapterNumber);
      }
    }
  }, [searchParams, selectedEp.id]);

  // 에피소드 변경 시 처리
  const handleSelectEpisode = (ep: LearningEpisode) => {
    setSelectedEp(ep);
    setCurrentCardIndex(1);
    setViewMode('cards');
    setOpenChapterId(ep.chapterNumber);

    // URL 쿼리 파라미터 실시간 동기화 (?ep=3)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('ep', String(ep.episodeNumber));
      window.history.replaceState(null, '', url.toString());
    }

    // 부드럽게 상단 뷰어로 스크롤
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // 카드 이동
  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => Math.max(1, prev - 1));
  };
  const handleNextCard = () => {
    setCurrentCardIndex((prev) => Math.min(selectedEp.cardCount, prev + 1));
  };

  // 완강 체크 토글
  const toggleComplete = (epId: number) => {
    setCompletedEps((prev) => {
      const next = prev.includes(epId) ? prev.filter((id) => id !== epId) : [...prev, epId];
      try {
        localStorage.setItem('yourpb_completed_episodes', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 링크 복사
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/learning?ep=${selectedEp.episodeNumber}`;
      navigator.clipboard.writeText(url);
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    }
  };

  // PDF 다운로드 URL 생성 (고화질 모바일 슬라이드형 PDF)
  const getPdfDownloadUrl = (epNum: number) => {
    const epDir = `ep_${String(epNum).padStart(2, '0')}`;
    return `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/learning/${epDir}/slide.pdf`;
  };

  // PDF 다운로드 클릭 핸들러 (Rule 7 준수: 프리미엄 회원 전용 다운로드)
  const handlePdfClick = () => {
    const isPremium = initialUser?.membership_status === 'premium';
    if (!isPremium) {
      setIsPaywallModalOpen(true);
    } else {
      const pdfUrl = getPdfDownloadUrl(selectedEp.episodeNumber);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `당신의피비_50강선행학습_${String(selectedEp.episodeNumber).padStart(2, '0')}강_${selectedEp.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 이미지 경로 생성 (Supabase Storage 글로벌 고속 CDN 스트리밍)
  const getCardImageUrl = (epNum: number, cardNum: number) => {
    const epDir = `ep_${String(epNum).padStart(2, '0')}`;
    return `https://vypehsjeufupmrpgcsbd.supabase.co/storage/v1/object/public/upload/learning/${epDir}/${cardNum}.png`;
  };

  const progressPercent = Math.round((completedEps.length / 50) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 text-white">
      {/* 1. 상단 브레드크럼 & 헤더 배너 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3인 패밀리 50부작 선행학습</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 select-none">
              자산관리 선행학습
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
              특허법인 처제 한과장과 현실주의 언니 한실장의 리얼 50주 금융 독립 스토리
            </p>
          </div>

          {/* 완강 진행률 뱃지 */}
          <div className="bg-white border border-black/10 rounded-2xl p-3.5 sm:p-4 min-w-45 sm:min-w-50 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 font-bold">
              <span>50강 완강 달성률</span>
              <span className="text-amber-800 font-black">{completedEps.length} / 50강 ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#EA580C] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 메인 콘텐츠 그리드 (좌측: 뷰어 & 대화 요약 / 우측: 50강 커리큘럼 로드맵) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* 좌측 영역 (7 cols): 하이브리드 카드뉴스 뷰어 & 처방전 */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          {/* A. 뷰어 카드 헤더 (강의 타이틀 + 탭 토글 + 공유) */}
          <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs">
            {/* 모바일 2단 개행 (챕터 ➔ 버튼) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-50 border border-[#EA580C]/30 text-amber-900 text-xs font-black rounded-md">
                  #{selectedEp.episodeNumber.toString().padStart(2, '0')}
                </span>
                <span className="text-xs font-bold text-gray-400 break-keep">{selectedEp.chapter}</span>
              </div>

              {/* 탭 토글: 카드뉴스 vs 릴스 영상 */}
              <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg border border-black/10 w-fit">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-dark-surface text-[#EA580C] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>카드뉴스 ({selectedEp.cardCount}장)</span>
                </button>
                {selectedEp.hasVideo && (
                  <button
                    onClick={() => setViewMode('video')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                      viewMode === 'video'
                        ? 'bg-dark-surface text-[#EA580C] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>릴스 영상</span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-snug break-keep">
              {selectedEp.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3.5 break-keep">{selectedEp.subtitle}</p>

            {/* B. 카드뉴스 슬라이더 뷰어 */}
            {viewMode === 'cards' ? (
              <div className="relative bg-[#F9F8F6] rounded-xl border border-black/10 overflow-hidden flex flex-col items-center select-none shadow-sm">
                {/* 메인 이미지 디스플레이 (종횡비 4:5 인스타 카드뉴스 규격, 웅장한 가독성 확보) */}
                <div className="relative w-full aspect-4/5 max-h-205 flex items-center justify-center bg-[#F9F8F6]">
                  <Image
                    src={getCardImageUrl(selectedEp.episodeNumber, currentCardIndex)}
                    alt={`${selectedEp.title} - ${currentCardIndex}장`}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                    className="object-contain"
                  />

                  {/* 좌우 넘김 버튼 (데스크톱 호버 & 모바일 터치) */}
                  <button
                    onClick={handlePrevCard}
                    disabled={currentCardIndex === 1}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-800 disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all border border-black/10 shadow-md"
                    aria-label="이전 카드"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextCard}
                    disabled={currentCardIndex === selectedEp.cardCount}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-800 disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all border border-black/10 shadow-md"
                    aria-label="다음 카드"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* 전체화면 확대 버튼 */}
                  <button
                    onClick={() => setIsFullScreenModal(true)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 hover:text-black transition-colors border border-black/10 cursor-pointer shadow-xs"
                    title="크게 보기"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 하단 컨트롤러 & 인디케이터 바 */}
                <div className="w-full bg-white border-t border-black/10 p-3.5 flex items-center justify-between">
                  {/* 페이지 인디케이터 닷 */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-60 py-1">
                    {Array.from({ length: selectedEp.cardCount }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCardIndex(idx + 1)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          currentCardIndex === idx + 1
                            ? 'w-6 bg-[#EA580C]'
                            : 'w-2 bg-black/15 hover:bg-black/30'
                        }`}
                        aria-label={`${idx + 1}번째 카드로 이동`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-gray-400">
                      <span className="text-gray-900 font-black">{currentCardIndex}</span> / {selectedEp.cardCount}
                    </span>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-black bg-black/5 hover:bg-black/10 border border-black/10 rounded-md transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedAlert ? '복사 완료!' : '공유'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* C. 릴스 동영상 뷰어 */
              <div className="relative bg-black rounded-xl border border-white/10 overflow-hidden flex flex-col items-center shadow-2xl">
                <div className="w-full aspect-9/16 max-h-160 bg-black flex items-center justify-center">
                  {selectedEp.videoUrl ? (
                    <video
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                      src={selectedEp.videoUrl}
                    >
                      해당 브라우저는 비디오 재생을 지원하지 않습니다.
                    </video>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#EA580C]" />
                      <p className="font-bold">릴스 동영상 인코딩 준비 중입니다.</p>
                      <p className="text-xs mt-1 text-gray-500">매주 금요일 순차 업로드됩니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* D. 3인 패밀리 대화 요약 (티키타카 & 캐릭터 스토리) */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-black/10 pb-2.5">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
                <span className="text-[#EA580C]">💬</span> 3인 패밀리 리얼 머니 토크
              </h3>
              <p className="text-xs text-gray-400 mt-1">식탁에서 나누는 현실 재테크 고민</p>
            </div>

            {/* 처제 한과장의 말 */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                <span className="w-fit px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">
                  🚨 처제 한과장 (44세)
                </span>
                <span className="text-xs text-gray-400">작년 분양 아파트 대출 상환 중</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed break-keep">
                "{selectedEp.dialogueSummary.manager}"
              </p>
            </div>

            {/* 아내 한실장의 말 */}
            <div className="bg-pink-50/70 border border-pink-200 rounded-xl p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                <span className="w-fit px-2 py-0.5 bg-pink-100 text-pink-800 text-xs font-bold rounded">
                  💡 아내 한실장 (52세)
                </span>
                <span className="text-xs text-gray-400">20년 내조의 현실주의자 언니</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed break-keep">
                "{selectedEp.dialogueSummary.director}"
              </p>
            </div>

            {/* 당신의 피비 홍선생의 원포인트 처방전 */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
                  🌲 당신의 피비 홍선생의 1줄 처방
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed mb-2.5 break-keep">
                "{selectedEp.prescription}"
              </p>

              {/* 핵심 요약 불릿 */}
              <div className="space-y-1 pt-2 border-t border-emerald-200">
                {selectedEp.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-emerald-900">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span className="break-keep">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* E. 유료 전환 CTA 버튼 영역 (Rule 7, 8 준수) */}
            <div className="pt-1 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link
                href="/diagnosis"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-[#EA580C]/20 cursor-pointer"
              >
                <span>내 포트폴리오 무료 진단하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handlePdfClick}
                className="flex-1 flex items-center justify-center gap-1.5 bg-dark-surface hover:bg-dark-surface-hover text-white border border-black/20 hover:border-[#EA580C] shadow-xs font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl transition-all cursor-pointer group"
              >
                <Lock className="w-3.5 h-3.5 text-[#EA580C] group-hover:scale-110 transition-transform" />
                <span>멤버십 전용 PDF 소장</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 우측 영역 (5 cols): 50강 전체 커리큘럼 아코디언 로드맵 */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-black/10 rounded-2xl p-5 sticky top-24 shadow-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#EA580C]" />
                <h3 className="text-lg font-black text-gray-900">50강 정주행 로드맵</h3>
              </div>
              <span className="text-xs font-bold text-gray-400">1년 50주 완성</span>
            </div>

            {/* 5개 챕터 아코디언 */}
            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
              {LEARNING_CHAPTERS.map((chapter) => {
                const isOpen = openChapterId === chapter.id;
                const chapterCompletedCount = chapter.episodes.filter((ep) =>
                  completedEps.includes(ep.id)
                ).length;

                return (
                  <div
                    key={chapter.id}
                    className="border border-black/10 rounded-xl overflow-hidden bg-[#FAF9F5]"
                  >
                    {/* 챕터 헤더 (클릭 시 펼침/접힘) */}
                    <button
                      onClick={() => setOpenChapterId(isOpen ? 0 : chapter.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-[#EA580C]">
                            {chapter.range}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            ({chapterCompletedCount}/{chapter.episodes.length} 완료)
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900">{chapter.title}</h4>
                      </div>
                      <span className="text-gray-400 font-black text-lg transition-transform duration-200">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {/* 챕터 내 에피소드 리스트 */}
                    {isOpen && (
                      <div className="border-t border-black/10 bg-white">
                        <div className="divide-y divide-black/5">
                          {chapter.episodes.map((ep) => {
                            const isSelected = selectedEp.id === ep.id;
                            const isCompleted = completedEps.includes(ep.id);

                            return (
                              <div
                                key={ep.id}
                                className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                                  isSelected
                                    ? 'bg-amber-50/70 border-l-4 border-[#EA580C]'
                                    : 'hover:bg-black/5'
                                }`}
                              >
                                <div
                                  onClick={() => handleSelectEpisode(ep)}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono font-black text-amber-800">
                                      #{ep.episodeNumber.toString().padStart(2, '0')}
                                    </span>
                                    {ep.hasVideo && (
                                      <span className="px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                                        VIDEO
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={`text-xs font-bold line-clamp-1 ${
                                      isSelected ? 'text-gray-950 font-extrabold' : 'text-gray-700'
                                    }`}
                                  >
                                    {ep.title}
                                  </p>
                                </div>

                                {/* 완강 체크 버튼 */}
                                <button
                                  onClick={() => toggleComplete(ep.id)}
                                  className="p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
                                  title={isCompleted ? '완강 취소' : '완강 체크'}
                                >
                                  <CheckCircle2
                                    className={`w-5 h-5 ${
                                      isCompleted ? 'text-emerald-400 fill-emerald-400/20' : 'text-gray-600'
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 모달: 카드뉴스 풀스크린 확대 모달 */}
      {/* ========================================================= */}
      {isFullScreenModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullScreenModal(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-2xl aspect-4/5 max-h-[85vh]">
            <Image
              src={getCardImageUrl(selectedEp.episodeNumber, currentCardIndex)}
              alt="전체화면 카드뉴스"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="mt-4 flex items-center gap-6">
            <button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 1}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-mono text-sm font-bold text-gray-300">
              {currentCardIndex} / {selectedEp.cardCount}
            </span>
            <button
              onClick={handleNextCard}
              disabled={currentCardIndex === selectedEp.cardCount}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. 모달: 프리미엄 멤버십 전용 PDF 소장 안내 (Rule 7 준수) */}
      {/* ========================================================= */}
      {isPaywallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/20 rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
            <button
              onClick={() => setIsPaywallModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-[#EA580C]/10 border border-[#EA580C]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7 text-[#EA580C]" />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              멤버십 전용 PDF 소장 혜택
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              본 50강 고화질 정밀 리서치 원본 PDF는 <strong className="text-white">프리미엄 멤버십 회원 전용</strong>으로 제공됩니다.
              인쇄 및 태블릿 필기에 최적화된 고해상도 자료로 평생 소장해 보세요.
            </p>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-left mb-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span>50강 자산관리 선행학습 전편 A4 고화질 PDF 무제한 소장</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span>1,000개 글로벌 ETF 및 우량주 엑스레이 정밀 리포트 열람</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span>월 커피 한 잔 구독료로 누리는 VIP 피비센터 자산관리</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/subscribe"
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg text-center"
              >
                프리미엄 멤버십 시작하기
              </Link>
              <button
                onClick={() => setIsPaywallModalOpen(false)}
                className="w-full py-2.5 text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

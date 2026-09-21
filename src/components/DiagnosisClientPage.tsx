'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Printer,
  Sparkles,
  Lock,
  MessageCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  FileText,
  X,
} from 'lucide-react';
import { BIAS_QUESTIONS, BiasQuestion } from '@/lib/biases-data';

interface UserSession {
  id: string;
  email: string | null;
  name: string;
  membership_status: string;
}

interface DiagnosisClientPageProps {
  initialUser: UserSession | null;
}

export default function DiagnosisClientPage({ initialUser }: DiagnosisClientPageProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> selectedOptionIndex
  const [submittedSteps, setSubmittedSteps] = useState<Record<number, boolean>>({}); // questionId -> isSubmitted
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({});
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const isPremium =
    initialUser?.membership_status === 'premium' ||
    initialUser?.email?.includes('admin');

  // 로컬스토리지 복원
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('yourpb_diagnosis_answers');
      const savedSubmitted = localStorage.getItem('yourpb_diagnosis_submitted');
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      if (savedSubmitted) setSubmittedSteps(JSON.parse(savedSubmitted));
    } catch {
      // 무시
    }
  }, []);

  const saveToStorage = (newAnswers: Record<number, number>, newSubmitted: Record<number, boolean>) => {
    try {
      localStorage.setItem('yourpb_diagnosis_answers', JSON.stringify(newAnswers));
      localStorage.setItem('yourpb_diagnosis_submitted', JSON.stringify(newSubmitted));
    } catch {
      // 무시
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submittedSteps[questionId]) return; // 이미 제출된 문항은 수정 불가(또는 다시 풀기로 제어)
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitCurrentStep = () => {
    const q = BIAS_QUESTIONS[currentStep];
    if (answers[q.id] === undefined) return;

    const newSubmitted = { ...submittedSteps, [q.id]: true };
    setSubmittedSteps(newSubmitted);
    saveToStorage(answers, newSubmitted);
  };

  const handleNext = () => {
    if (currentStep < BIAS_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('진단 기록을 모두 초기화하고 처음부터 다시 시작하시겠습니까?')) {
      setAnswers({});
      setSubmittedSteps({});
      setCurrentStep(0);
      setIsCompleted(false);
      setIsStarted(false);
      localStorage.removeItem('yourpb_diagnosis_answers');
      localStorage.removeItem('yourpb_diagnosis_submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSolution = (qId: number) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // 통계 집계
  const evaluatedQuestions = BIAS_QUESTIONS.map((q) => {
    const selectedIdx = answers[q.id];
    const isAnswered = selectedIdx !== undefined && submittedSteps[q.id];
    const isBiased = isAnswered && q.options[selectedIdx]?.isBias;
    return {
      ...q,
      selectedIdx,
      isAnswered,
      isBiased,
    };
  });

  const biasedList = evaluatedQuestions.filter((q) => q.isBiased);
  const cognitiveBiasedCount = biasedList.filter((q) => q.category === 'cognitive').length;
  const emotionalBiasedCount = biasedList.filter((q) => q.category === 'emotional').length;
  const totalBiasedCount = biasedList.length;

  const getRiskGrade = (count: number) => {
    if (count <= 3) return { label: '안정 (Mind Master)', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (count <= 7) return { label: '주의 (Normal Investor)', color: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    return { label: '고위험 (Bias Alert)', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  };

  const riskGrade = getRiskGrade(totalBiasedCount);

  const handlePrintPdf = () => {
    if (isPremium) {
      window.print();
    } else {
      setShowPremiumModal(true);
    }
  };

  const currentQ = BIAS_QUESTIONS[currentStep];
  const currentSelectedIdx = answers[currentQ.id];
  const isCurrentSubmitted = submittedSteps[currentQ.id];
  const isCurrentBiased = isCurrentSubmitted && currentSelectedIdx !== undefined && currentQ.options[currentSelectedIdx]?.isBias;

  const progressPercent = Math.round(((currentStep + 1) / BIAS_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 selection:bg-yellow-accent selection:text-black">
      {/* ============================================================ */}
      {/* 1. 화면 전용 (Web View) 컨테이너 */}
      {/* ============================================================ */}
      <div className="print:hidden">
        {/* 상단 히어로 배너 */}
        <section className="relative overflow-hidden bg-linear-to-b from-[#111111] via-[#080808] to-[#000000] border-b border-white/10 pt-28 pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-accent/10 border border-yellow-accent/30 text-yellow-accent text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>행동재무학 기반 실전 진단 솔루션</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              투자 행동 편향 정밀 진단
            </h1>
            
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
              워런 버핏은 &ldquo;투자는 지능이 아니라 감정을 다스리는 싸움&rdquo;이라 했습니다.<br className="hidden sm:inline" />
              19가지 실전 문항을 통해 나의 무의식적 투자 심리 약점을 진단하고, 맞춤형 극복 처방전을 발급받으세요.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-gray-400 font-medium">
              <span className="px-3 py-1 bg-white/5 border border-white/10">⏱️ 소요시간 약 5분</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">📊 총 19문항 정밀 분석</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">🎁 진단 및 해설 100% 무료</span>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
              {!isStarted && !isCompleted ? (
                <button
                  onClick={() => {
                    setIsStarted(true);
                    setTimeout(() => {
                      cardRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-8 py-4 bg-yellow-accent hover:bg-yellow-400 text-black text-base font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(255,215,0,0.25)] hover:scale-105 cursor-pointer"
                >
                  <Brain className="w-5 h-5" />
                  <span>진단 시작하기</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : isStarted && !isCompleted ? (
                <button
                  onClick={() => {
                    cardRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-yellow-accent hover:bg-yellow-400 text-black text-base font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(255,215,0,0.25)] hover:scale-105 cursor-pointer"
                >
                  <Brain className="w-5 h-5" />
                  <span>진단 이어하기 (Q{currentStep + 1})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-yellow-accent hover:bg-yellow-400 text-black text-base font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(255,215,0,0.25)] hover:scale-105 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>진단 종합 결과 확인하기</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. 카드뉴스 설문 진행 영역 (진행 중일 때) */}
        {/* ============================================================ */}
        {(!isCompleted || !isStarted) && (
          <div ref={cardRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {isStarted && (
              <div className="bg-[#0f0f12] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
                {/* 상단 프로그레스 바 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-yellow-accent tracking-wider">
                      QUESTION {currentStep + 1} / {BIAS_QUESTIONS.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold border ${
                          currentQ.category === 'cognitive'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {currentQ.categoryLabel}
                      </span>
                      <span className="text-gray-400 font-bold">{progressPercent}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 overflow-hidden">
                    <div
                      className="bg-yellow-accent h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 문항 헤더 */}
                <div className="pt-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-400">
                      편향 #{currentQ.id} · {currentQ.englishName}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {currentQ.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      {currentQ.shortDesc}
                    </p>
                  </div>
                </div>

                {/* 질문 박스 */}
                <div className="p-4 sm:p-5 bg-white/5 border border-white/10 text-sm sm:text-base font-semibold text-gray-100 leading-relaxed">
                  <span className="text-yellow-accent font-black mr-2">Q.</span>
                  {currentQ.question}
                </div>

                {/* 선지 리스트 */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = currentSelectedIdx === idx;
                    const isSubmitted = isCurrentSubmitted;
                    const isOptBiased = opt.isBias;

                    let borderClass = 'border-white/10 hover:border-white/30 bg-white/5';
                    if (isSelected && !isSubmitted) {
                      borderClass = 'border-yellow-accent bg-yellow-accent/10 ring-1 ring-yellow-accent';
                    } else if (isSubmitted) {
                      if (isSelected) {
                        borderClass = isOptBiased
                          ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500'
                          : 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(currentQ.id, idx)}
                        className={`w-full text-left p-4 sm:p-4.5 border transition-all flex items-start gap-3.5 ${
                          isSubmitted ? 'cursor-default' : 'cursor-pointer'
                        } ${borderClass}`}
                      >
                        <span
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                            isSelected
                              ? isSubmitted
                                ? isOptBiased
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-yellow-accent text-black border-yellow-accent'
                              : 'bg-black/50 text-gray-400 border-white/20'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium pt-0.5">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 판정 전 제출 버튼 */}
                {!isCurrentSubmitted && (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={currentSelectedIdx === undefined}
                      onClick={handleSubmitCurrentStep}
                      className={`w-full py-4 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                        currentSelectedIdx === undefined
                          ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-accent hover:bg-yellow-400 text-black cursor-pointer'
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>선택 완료 및 진단 판정하기</span>
                    </button>
                  </div>
                )}

                {/* 판정 결과 피드백 섹션 */}
                {isCurrentSubmitted && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    {/* 판정 결과 배너 */}
                    <div
                      className={`p-4 sm:p-5 border ${
                        isCurrentBiased
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-base sm:text-lg mb-1.5">
                        {isCurrentBiased ? (
                          <>
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                            <span className="text-rose-400">⚠️ [{currentQ.name}] 주의 판정!</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400">✅ 합리적 투자 판단! (편향 없음)</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-gray-200 font-normal">
                        {currentQ.explanation}
                      </p>
                    </div>

                    {/* 편향에 걸렸을 때: 상세 솔루션 아코디언 */}
                    <div className="border border-white/10 bg-black/40 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSolution(currentQ.id)}
                        className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-gray-300 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-yellow-accent" />
                          <span>💡 {currentQ.name}의 핵심 특징 & 5대 극복 처방전 확인</span>
                        </span>
                        {expandedSolutions[currentQ.id] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {expandedSolutions[currentQ.id] && (
                        <div className="p-4 sm:p-5 pt-0 space-y-4 text-xs sm:text-sm border-t border-white/10 text-gray-300 leading-relaxed">
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-yellow-accent text-xs uppercase tracking-wider">
                              1. 편향의 본질 및 영향
                            </h4>
                            <p className="text-gray-300">{currentQ.concept.definition}</p>
                            <p className="text-gray-400 text-xs">{currentQ.concept.impact}</p>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="font-bold text-yellow-accent text-xs uppercase tracking-wider">
                              2. 주요 발현 특징
                            </h4>
                            <ul className="space-y-1 text-gray-400 text-xs list-disc list-inside">
                              {currentQ.traits.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              3. 당신의 피비 추천 실천 솔루션
                            </h4>
                            <div className="space-y-1.5 p-3 bg-emerald-950/20 border border-emerald-500/20">
                              {currentQ.actionPlans.map((plan, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                                  <span className="font-black text-emerald-400 shrink-0">✓</span>
                                  <span>{plan}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 하단 이전/다음 네비게이션 버튼 */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        disabled={currentStep === 0}
                        onClick={handlePrev}
                        className={`px-5 py-3 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 flex items-center gap-2 border border-white/10 ${
                          currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>이전 문항</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-3 bg-yellow-accent hover:bg-yellow-400 text-black text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>
                          {currentStep < BIAS_QUESTIONS.length - 1
                            ? `다음 문항 (${currentStep + 2}/${BIAS_QUESTIONS.length})`
                            : '종합 진단 결과 확인하기 🎉'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. 종합 결과 대시보드 (19문항 모두 완료 시) */}
        {/* ============================================================ */}
        {isCompleted && (
          <div ref={resultRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* 결과 종합 헤더 카드 */}
            <div className="bg-[#0f0f12] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold text-yellow-accent uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  진단 완료 리포트
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {initialUser?.name || '고객'}님의 투자 행동 편향 진단 종합 결과
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                  19가지 행동재무학적 투자 문항을 정밀 분석한 결과, 아래와 같은 심리적 취약점이 확인되었습니다.
                </p>
              </div>

              {/* 스코어보드 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white/5 border border-white/10 text-center space-y-1">
                  <span className="text-xs text-gray-400 font-medium">주의 판정 편향 수</span>
                  <div className="text-3xl font-black text-yellow-accent">
                    {totalBiasedCount} <span className="text-sm font-normal text-gray-400">/ 19개</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 text-center space-y-1">
                  <span className="text-xs text-gray-400 font-medium">유형별 취약도</span>
                  <div className="text-xs text-gray-300 font-bold pt-1 space-y-0.5">
                    <div>인지적 오류: <span className="text-blue-400">{cognitiveBiasedCount}개</span></div>
                    <div>감정적 편향: <span className="text-amber-400">{emotionalBiasedCount}개</span></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 text-center space-y-1">
                  <span className="text-xs text-gray-400 font-medium">심리적 위험도 등급</span>
                  <div className="pt-0.5">
                    <span className={`inline-block px-3 py-1 text-xs font-black border ${riskGrade.badge}`}>
                      {riskGrade.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* PDF 인쇄 버튼 & 다시 풀기 버튼 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>진단 다시 풀기</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="w-full sm:w-auto px-6 py-3.5 bg-yellow-accent hover:bg-yellow-400 text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>📄 맞춤형 행동편향 컨설팅 처방전 다운로드 (PDF)</span>
                  {!isPremium && (
                    <span className="ml-1 px-1.5 py-0.5 bg-black/80 text-yellow-accent text-[10px] font-extrabold">
                      PREMIUM
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 취약 편향 집중 분석 카드 리스트 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>집중 관리 대상 편향 ({totalBiasedCount}건)</span>
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  클릭하여 세부 솔루션을 확인하세요
                </span>
              </div>

              {biasedList.length === 0 ? (
                <div className="p-8 bg-[#0f0f12] border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-400">완벽한 심리 통제력!</h4>
                  <p className="text-xs text-gray-300">
                    19개 편향 중 단 한 건의 주의 편향도 발견되지 않았습니다. 현재의 냉정하고 원칙적인 투자 태도를 지속하세요.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {biasedList.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[#0f0f12] border border-white/10 hover:border-white/20 p-5 sm:p-6 space-y-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-rose-400">#{q.id}</span>
                            <h4 className="text-base sm:text-lg font-black text-white">{q.name}</h4>
                            <span className="text-xs text-gray-400">({q.englishName})</span>
                          </div>
                          <p className="text-xs text-gray-400">{q.shortDesc}</p>
                        </div>
                        <span
                          className={`self-start sm:self-center px-2 py-0.5 text-[11px] font-bold border ${
                            q.category === 'cognitive'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {q.categoryLabel}
                        </span>
                      </div>

                      {/* 실천 극복 솔루션 */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          당신의 피비 실천 극복 처방전
                        </span>
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                          {q.actionPlans.map((plan, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                              <span className="font-black text-emerald-400 shrink-0">✓</span>
                              <span>{plan}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 전체 19개 편향 점검 매트릭스 표 */}
            <div className="bg-[#0f0f12] border border-white/10 p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-yellow-accent" />
                <span>19개 행동 편향 종합 진단 현황표</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {evaluatedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`p-2.5 border flex items-center justify-between ${
                      q.isBiased
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    <span className="font-medium truncate max-w-45">
                      {q.id}. {q.name}
                    </span>
                    <span
                      className={`font-black text-[11px] shrink-0 ${
                        q.isBiased ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {q.isBiased ? '⚠️ 주의' : '✅ 정상'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. 하단 Contact Us & 1:1 VIP 자산관리 상담 배너 (Monthly 스타일) */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
          <div className="p-6 sm:p-8 bg-[#0a0a0c] border border-white/15 text-white space-y-6 shadow-2xl">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-yellow-accent uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                당신의 피비 VIP 자산관리
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                나의 투자 편향을 보완하는 맞춤형 포트폴리오가 필요하신가요?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl font-normal">
                감정과 충동을 배제한 <strong>HRP(계층적 리스크 패리티) 자산배분 모델</strong>과 룰 기반 분산 전략을 당신의 피비 수석 매니저가 1:1로 설계해 드립니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/support"
                className="w-full sm:w-auto px-6 py-3.5 bg-yellow-accent hover:bg-yellow-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>1:1 상담 및 문의하기</span>
              </Link>
              <Link
                href="/monthly"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>이달의 모델 포트폴리오 둘러보기</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* 5. 프리미엄 유료 혜택 안내 모달 (무료 회원 클릭 시) */}
      {/* ============================================================ */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-[#111114] border border-yellow-accent/40 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-yellow-accent/10 border border-yellow-accent/30 flex items-center justify-center mx-auto text-yellow-accent">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-yellow-accent uppercase tracking-widest">
                프리미엄 멤버십 전용 혜택
              </span>
              <h3 className="text-xl font-black text-white">
                정밀 컨설팅 처방전 PDF 출력
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                고객 맞춤형 3페이지 정밀 행동편향 분석 및 영구 보관용 PDF 리포트 출력은 <strong className="text-yellow-accent font-bold">프리미엄 회원</strong> 전용 서비스입니다.
              </p>
            </div>

            <div className="p-3.5 bg-white/5 border border-white/10 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2 font-bold text-yellow-accent">
                <Sparkles className="w-3.5 h-3.5" />
                <span>프리미엄 회원 제공 혜택</span>
              </div>
              <ul className="space-y-1 text-gray-400 pl-4 list-disc">
                <li>3페이지 고해상도 행동편향 맞춤 처방전 PDF 무제한 인쇄 및 소장</li>
                <li>1,000대 글로벌 주식 & ETF 원본 리서치 보고서 무제한 다운로드</li>
                <li>HRP 기반 글로벌 모델 포트폴리오 비중 실시간 열람</li>
                <li>1:1 프라이빗 뱅커(PB) 자산배분 유선 상담 우선 배정</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/subscribe"
                className="w-full py-3.5 bg-yellow-accent hover:bg-yellow-400 text-black font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>프리미엄 멤버십 업그레이드</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. [PRINT ONLY] 고해상도 A4 PDF 인쇄 전용 레이아웃 */}
      {/* ============================================================ */}
      <div className="hidden print:block text-black bg-white p-8 max-w-[210mm] mx-auto font-sans leading-normal">
        {/* 인쇄 1페이지: 표지 및 종합 진단 요약 */}
        <div className="space-y-6 min-h-[280mm] flex flex-col justify-between">
          <div className="space-y-6">
            {/* 리포트 상단 헤더 */}
            <div className="border-b-2 border-black pb-4 flex items-end justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-600 uppercase">
                  YOURPB BEHAVIORAL FINANCE CONSULTING REPORT
                </div>
                <h1 className="text-2xl font-black text-black pt-1">
                  투자 행동 편향 정밀 진단 및 행동 교정 처방전
                </h1>
              </div>
              <div className="text-right text-xs text-gray-600 space-y-0.5">
                <div>발행일자: {new Date().toLocaleDateString('ko-KR')}</div>
                <div>고객명: <strong>{initialUser?.name || 'VIP 고객'}</strong> 님</div>
              </div>
            </div>

            {/* 인트로 총평 박스 */}
            <div className="p-4 bg-gray-50 border border-gray-300 space-y-2 text-xs leading-relaxed">
              <div className="font-bold text-sm text-black">
                📌 행동재무학 진단 종합 총평
              </div>
              <p className="text-gray-700">
                본 보고서는 고객님의 무의식적 투자 심리 및 인지적 오류를 교정하기 위해 작성된 맞춤형 컨설팅 처방전입니다.
                진단 결과, 총 19개 핵심 편향 중 <strong>{totalBiasedCount}개</strong>의 심리 편향에 주의가 필요한 것으로 분석되었습니다.
              </p>
            </div>

            {/* 19개 편향 매트릭스 표 */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-black uppercase tracking-wider">
                1. 19개 투자 편향 종합 진단 현황표
              </div>
              <table className="w-full text-[10px] border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="border border-gray-300 p-1.5 text-center w-10">No</th>
                    <th className="border border-gray-300 p-1.5 text-left">편향 명칭</th>
                    <th className="border border-gray-300 p-1.5 text-center w-20">구분</th>
                    <th className="border border-gray-300 p-1.5 text-center w-20">진단 결과</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluatedQuestions.map((q) => (
                    <tr key={q.id} className={q.isBiased ? 'bg-red-50/50' : ''}>
                      <td className="border border-gray-300 p-1 text-center font-bold">{q.id}</td>
                      <td className="border border-gray-300 p-1 font-medium">{q.name} ({q.englishName})</td>
                      <td className="border border-gray-300 p-1 text-center text-gray-600">{q.categoryLabel}</td>
                      <td className="border border-gray-300 p-1 text-center font-bold">
                        {q.isBiased ? (
                          <span className="text-red-600">⚠️ 주의 판정</span>
                        ) : (
                          <span className="text-emerald-700">✅ 정상</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1페이지 하단 푸터 */}
          <div className="border-t border-gray-300 pt-3 flex items-center justify-between text-[10px] text-gray-500">
            <span>당신의 피비 글로벌 리서치 & 행동재무학 컨설팅 센터</span>
            <span>Page 1 / 2</span>
          </div>
        </div>

        {/* 인쇄 2페이지: 취약 편향별 맞춤 실천 솔루션 */}
        <div className="space-y-6 pt-10 min-h-[280mm] flex flex-col justify-between break-before-page">
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-2">
              <h2 className="text-xl font-black text-black">
                2. 취약 행동 편향 집중 처방 강령 (Action Plans)
              </h2>
              <p className="text-xs text-gray-600 pt-0.5">
                아래 항목들은 고객님의 장기 복리 수익률을 훼손할 수 있는 핵심 심리 약점입니다. 매매 실행 전 반드시 상기하십시오.
              </p>
            </div>

            {biasedList.length === 0 ? (
              <div className="p-8 border border-gray-300 text-center space-y-2">
                <div className="text-sm font-bold text-emerald-800">우수한 심리 통제력 유지 중</div>
                <p className="text-xs text-gray-600">
                  주의 판정을 받은 편향이 없습니다. 현재의 룰 기반 분산투자 원칙을 꾸준히 고수하십시오.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {biasedList.map((q) => (
                  <div key={q.id} className="p-3.5 border border-gray-300 bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <span className="font-black text-xs text-black">
                        #{q.id}. {q.name} ({q.categoryLabel})
                      </span>
                      <span className="text-[10px] text-red-600 font-bold">⚠️ 집중 관리</span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-relaxed">
                      <strong>본질:</strong> {q.concept.definition}
                    </p>
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-black uppercase">
                        🛡️ 실천 극복 행동 체크리스트:
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-[10px] text-gray-800 pl-2">
                        {q.actionPlans.map((plan, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>{plan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2페이지 하단 푸터 */}
          <div className="border-t border-gray-300 pt-3 flex items-center justify-between text-[10px] text-gray-500">
            <span>YOURPB.COM  |  CONFIDENTIAL & PROPRIETARY</span>
            <span>Page 2 / 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

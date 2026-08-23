'use client';

import React, { useState } from 'react';
import { Film, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signUp } from '../actions/auth';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await signIn({ email, password });
        if (result && result.error) {
          setError(result.error);
        }
      } else {
        const result = await signUp({ name, email, password });
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          setSuccessMessage(result.message || '회원가입 신청이 완료되었습니다.');
          // 회원가입 성공 시 필드 초기화
          setName('');
          setEmail('');
          setPassword('');
        }
      }
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-hidden font-sans"
      style={{ backgroundImage: `url('/movie-bg.jpg')` }}
    >
      {/* 검은색 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-black/40 z-0" />

      {/* 시네마틱 빛 효과 */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#203764]/20 rounded-full blur-3xl z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* 글래스모피즘 카드 */}
        <div className="bg-[#203764]/40 backdrop-blur-xl border border-[#203764]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

          {/* 카드 상단 데코레이션: 빨간 원 안에 필름 아이콘 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#dc2626] rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 mb-3 border border-red-500/20">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">YOURPB</h1>
            <p className="text-xs text-slate-400 mt-1">ETF Investment Portfolio Manager</p>
          </div>

          {/* 로그인 / 회원가입 탭 전환 */}
          <div className="flex bg-slate-950/60 rounded-xl p-1 mb-6 border border-slate-800/80">
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'login'
                  ? 'bg-[#dc2626] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              로그인
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'signup'
                  ? 'bg-[#dc2626] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              회원가입
            </button>
          </div>

          {/* 에러/성공 메시지 피드백 */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs text-red-200 leading-relaxed">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-6 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs text-green-200 leading-relaxed">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium ml-1">이름</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border rounded-xl text-sm placeholder:text-slate-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all duration-300"
                    style={{ borderColor: 'rgba(30, 41, 59, 0.8)', color: '#ffffff' }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium ml-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border rounded-xl text-sm placeholder:text-slate-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all duration-300"
                  style={{ borderColor: 'rgba(30, 41, 59, 0.8)', color: '#ffffff' }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium ml-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border rounded-xl text-sm placeholder:text-slate-500 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all duration-300"
                  style={{ borderColor: 'rgba(30, 41, 59, 0.8)', color: '#ffffff' }}
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/40 relative overflow-hidden"
              style={{ backgroundColor: '#dc2626' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>처리 중...</span>
                </div>
              ) : (
                <span>{activeTab === 'login' ? '로그인' : '계정 생성'}</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

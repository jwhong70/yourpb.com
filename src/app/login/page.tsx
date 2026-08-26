'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // 탭 상태에 따른 동적 스타일 변수
  const isLogin = activeTab === 'login';
  const boxBgColor = 'bg-[#000000]';
  const labelColor = 'text-gray-300';
  const logoFilter = '';
  const descColor = 'text-gray-400';
  const tabContainerColor = 'bg-neutral-900 border-neutral-800';
  const tabTextColor = 'text-gray-400 hover:text-white';
  const buttonBgColor = isLogin ? 'bg-[#D4AF37] hover:bg-[#c29d2f]' : 'bg-[#9E9E9E] hover:bg-[#8f8f8f]';
  const buttonTextColor = 'text-black';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#F9F8F6] overflow-hidden font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* activeTab 상태에 따른 동적 배경색 지정 및 얇은 테두리 적용 */}
        <div className={`${boxBgColor} border border-white/15 rounded-none p-8 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-500`}>
          
          {/* 카드 상단 데코레이션: 당신의 피비 로고 (동적 필터 적용) */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/yourpb-final-logo.png"
              alt="당신의 피비"
              className={`h-10 w-auto object-contain select-none mb-2 transition-all duration-500 ${logoFilter}`}
            />
            <p className={`text-xs ${descColor} font-extrabold mt-1 uppercase tracking-wider transition-colors duration-500`}>ETF Portfolio 자산관리 파트너</p>
          </div>

          {/* 로그인 / 회원가입 탭 전환 (동적 스타일) */}
          <div className={`flex rounded-none p-1 mb-6 border transition-all duration-500 ${tabContainerColor}`}>
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-none text-sm font-black transition-all duration-300 cursor-pointer ${activeTab === 'login'
                  ? 'bg-[#D4AF37] text-black shadow-xs'
                  : tabTextColor
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
              className={`flex-1 py-2.5 rounded-none text-sm font-black transition-all duration-300 cursor-pointer ${activeTab === 'signup'
                  ? 'bg-[#D4AF37] text-black shadow-xs'
                  : tabTextColor
                }`}
            >
              회원가입
            </button>
          </div>

          {/* 에러/성공 메시지 피드백 (다크 톤) */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-none p-3 mb-6 flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs text-red-200 leading-relaxed font-semibold">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/30 rounded-none p-3 mb-6 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs text-green-200 leading-relaxed font-semibold">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className={`text-xs ${labelColor} font-bold ml-1 transition-colors duration-500`}>이름</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-black rounded-none text-sm focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all duration-300 text-gray-900 font-semibold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`text-xs ${labelColor} font-bold ml-1 transition-colors duration-500`}>이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-black rounded-none text-sm focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all duration-300 text-gray-900 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs ${labelColor} font-bold ml-1 transition-colors duration-500`}>비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-black rounded-none text-sm focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all duration-300 text-gray-900 font-semibold"
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 ${buttonBgColor} ${buttonTextColor} active:scale-95 font-black rounded-none text-sm transition-all duration-300 disabled:opacity-50 shadow-md shadow-black/10`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User as UserIcon, 
  Mail, 
  Award, 
  Calendar, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  AlertTriangle,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { cancelSubscription } from '@/app/actions/subscription';
import { deleteAccount, signOut } from '@/app/actions/auth';

interface User {
  id: string;
  email: string | null | undefined;
  name: string;
  membership_status: string;
  subscription_end_date: string | null | undefined;
}

interface MyPageClientProps {
  initialUser: User;
}

export default function MyPageClient({ initialUser }: MyPageClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>(initialUser);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isPremium = user.membership_status === 'premium';

  // 1. 구독 해지 (무료 전환) 핸들러
  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      '정말 프리미엄 멤버십을 해지하시겠습니까?\n해지 시 VIP 분석 데이터 및 정밀 리포트 혜택이 종료되고 무료 회원으로 즉시 전환됩니다.'
    );

    if (!confirmed) return;

    setIsCanceling(true);
    try {
      const result = await cancelSubscription('마이페이지에서 사용자 직접 구독 해지');
      if (result.success) {
        alert('프리미엄 멤버십이 성공적으로 해지되었습니다. 무료 회원으로 전환되었습니다.');
        setUser(prev => ({
          ...prev,
          membership_status: 'free',
          subscription_end_date: null,
        }));
        router.refresh();
      } else {
        alert(`해지 처리 실패: ${result.error}`);
      }
    } catch (err: any) {
      alert(`오류 발생: ${err.message || err}`);
    } finally {
      setIsCanceling(false);
    }
  };

  // 2. 회원 탈퇴 핸들러
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        alert('회원 탈퇴가 완료되었습니다. 그동안 당신의 피비를 이용해 주셔서 감사합니다.');
        window.location.href = '/';
      } else {
        alert(`회원 탈퇴 실패: ${result.error}`);
        setIsDeleting(false);
      }
    } catch (err: any) {
      alert(`오류 발생: ${err.message || err}`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. 상단 타이틀 */}
      <div className="border-b border-black/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
          회원정보 및 멤버십 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          내 계정 정보 확인 및 멤버십 유료 전환, 구독 해지, 회원 탈퇴를 관리할 수 있습니다.
        </p>
      </div>

      {/* 2. 기본 계정 정보 카드 */}
      <div className="bg-white border border-black shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-black flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-black" />
            내 계정 정보
          </h2>
          {isPremium ? (
            <span className="flex items-center gap-1 text-xs font-black text-black bg-[#D4AF37] px-3 py-1 rounded-full select-none">
              <Award className="w-3.5 h-3.5" />
              Premium 회원
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full select-none">
              Free 무료 회원
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 block">이름</span>
            <span className="text-base font-black text-black">{user.name}</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 block">이메일 계정</span>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm sm:text-base font-semibold text-gray-800">{user.email || '이메일 정보 없음'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 멤버십 상태 및 관리 카드 */}
      <div className="bg-white border border-black shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-black flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            멤버십 상태 및 구독 관리
          </h2>
        </div>

        {isPremium ? (
          /* A. 프리미엄 이용 중인 경우 (무료 전환 / 해지 옵션 제공) */
          <div className="space-y-6">
            <div className="bg-black text-white p-6 sm:p-8 border-l-4 border-[#D4AF37] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-block bg-[#D4AF37] text-black text-[10px] font-black px-2 py-0.5 tracking-wider uppercase mb-2">
                    ACTIVE VIP
                  </div>
                  <h3 className="text-xl font-black text-white">프리미엄 멤버십 이용 중</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">
                    당신의 피비 20인 투자 대가 AI 매매 시그널 및 2p 정밀 PDF 리포트를 무제한 이용 중이십니다.
                  </p>
                </div>
                {user.subscription_end_date && (
                  <div className="bg-white/10 p-3 sm:text-right shrink-0">
                    <span className="text-[11px] text-gray-400 block">구독 만료 예정일</span>
                    <span className="text-base font-mono font-black text-[#D4AF37]">
                      {user.subscription_end_date.split('T')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 무료 전환 / 구독 해지 버튼 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                구독 해지 시 즉시 무료 회원으로 전환되며 프리미엄 혜택이 종료됩니다.
              </div>
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="w-full sm:w-auto px-5 py-2.5 border border-red-500/40 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCanceling ? '해지 처리 중...' : '구독 해지 / 환불 신청 (무료 전환)'}
              </button>
            </div>
          </div>
        ) : (
          /* B. 무료 회원인 경우 (유료 전환 옵션 제공) */
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-black">현재 무료(Free) 회원입니다.</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    프리미엄 멤버십으로 전환하고 당신의 피비의 모든 VIP 분석 도구를 무제한으로 이용해 보세요.
                  </p>
                </div>
                <Link
                  href="/subscribe"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#c29d2f] text-black font-black text-sm transition-all shadow-md shrink-0"
                >
                  <span>프리미엄 멤버십 구독하기 (유료 전환)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 프리미엄 혜택 목록 */}
              <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>투자 대가 20인 AI 매매 시그널 & 적정가치</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>1,000대 글로벌 주식 120주 주봉 캔들 분석</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>ETF & 주식 2p 정밀 PDF 리포트 무제한 다운로드</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>VIP 거시경제 지표 및 자산배분 모델 열람</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 회원 탈퇴 (Danger Zone) */}
      <div className="bg-white border border-red-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-red-100 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-red-600 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            계정 관리 및 회원 탈퇴
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">회원 탈퇴</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              탈퇴 시 계정 정보, 찜 목록, 구독 정보가 즉시 영구 삭제되며 복구할 수 없습니다.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
              className="px-4 py-2 border border-gray-300 hover:border-red-500 text-gray-600 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              회원 탈퇴
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                type="button"
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? '탈퇴 처리 중...' : '정말 탈퇴하기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

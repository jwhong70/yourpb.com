import React from 'react';
import Link from 'next/link';
import { Phone, Mail, Clock, ArrowLeft, Headphones } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSessionUser } from '@/app/actions/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '고객센터 - YOURPB',
  description: '당신의 피비 서비스 이용 중 불편하신 사항이나 피드백이 있으시면 언제든지 문의해 주세요.',
};

export default async function SupportPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-gray-900 font-sans">
      <Header initialUser={user} />
      
      <main className="grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* 뒤로 가기 링크 */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-900 active:scale-95 text-white font-bold text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>메인으로 돌아가기</span>
            </Link>
          </div>

          {/* 메인 안내 카드 */}
          <div className="bg-[#000000] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            
            <div className="space-y-8 relative">
              
              {/* 타이틀 헤더 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Headphones className="w-8 h-8 text-[#D4AF37]" />
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">고객센터</h1>
                </div>
                <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                  당신의 피비 서비스 이용 중 불편한 점이 있으시거나 제휴 및 기타 문의 사항이 있으시다면 언제든 아래의 채널로 연락 주시기 바랍니다. 친절하고 신속하게 답변해 드리겠습니다.
                </p>
              </div>

              {/* 컨택 수단 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. 전화 문의 */}
                <a
                  href="tel:070-4507-4460"
                  className="group block p-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-all rounded-full">
                      <Phone className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-sm font-bold text-white/50">전화 상담</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-lg font-black text-white block group-hover:text-[#D4AF37] transition-colors">
                      070-4507-4460
                    </span>
                    <span className="text-xs text-white/40 block">클릭 시 즉시 통화 연결</span>
                  </div>
                </a>

                {/* 2. 이메일 문의 */}
                <a
                  href="mailto:jwhong70@gmail.com"
                  className="group block p-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-all rounded-full">
                      <Mail className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-sm font-bold text-white/50">이메일 문의</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base font-black text-white block group-hover:text-[#D4AF37] transition-colors break-all">
                      jwhong70@gmail.com
                    </span>
                    <span className="text-xs text-white/40 block">제휴 및 일반 서면 피드백</span>
                  </div>
                </a>

              </div>

              {/* 3. 업무 시간 정보 */}
              <div className="p-5 bg-white/5 border border-white/5 flex gap-4 items-start text-left">
                <Clock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white">운영 시간 및 안내</span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)<br />
                    전화 연결이 어려운 경우 메일을 남겨주시면 담당자가 신속히 이메일로 답변해 드립니다.
                  </p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}

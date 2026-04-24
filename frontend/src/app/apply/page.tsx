"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, ArrowLeft, Gift } from 'lucide-react';

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '비개발자 입문'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 구현 시: fetch('http://localhost:8000/api/v1/apply', ...) 호출
    console.log("신청 데이터:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111] border border-blue-500/30 p-10 rounded-[3rem] text-center"
        >
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">신청 완료!</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            바이브 코딩 무료 특강 신청이 정상적으로 접수되었습니다. <br/>
            입력하신 이메일로 <strong>'바이브 코딩 가이드북(PDF)'</strong>을 보내드렸습니다.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all"
          >
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* 왼쪽: 강의 혜택 요약 (Module 1, 4 기반) */}
        <div className="space-y-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} /> 돌아가기
          </button>
          <h1 className="text-5xl font-black leading-tight">
            가장 빠른 <span className="text-blue-500">시작</span>,<br/>
            무료 특강 신청
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            3시간 만에 코딩의 패러다임을 바꿉니다. <br/>
            감독(Director)으로서 첫 번째 앱을 배포하는 경험을 놓치지 마세요.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Gift className="text-blue-400 shrink-0" />
              <div>
                <p className="font-bold">신청 즉시 혜택</p>
                <p className="text-sm text-gray-500 font-light italic">마법의 프롬프트 템플릿 & 환경설정 가이드북 증정</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <CheckCircle2 className="text-green-500 shrink-0" />
              <div>
                <p className="font-bold">실습 포함</p>
                <p className="text-sm text-gray-500">Bolt.new를 활용한 나만의 모바일 명함 제작</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 신청 폼 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1 uppercase tracking-widest">성함</label>
              <input 
                type="text" required
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all"
                placeholder="홍길동"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1 uppercase tracking-widest">이메일 주소</label>
              <input 
                type="email" required
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all"
                placeholder="vibe@example.com"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1 uppercase tracking-widest">휴대폰 번호</label>
              <input 
                type="tel" required
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all"
                placeholder="010-0000-0000"
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1 uppercase tracking-widest">관심 분야</label>
              <select 
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all appearance-none"
                onChange={e => setFormData({...formData, interest: e.target.value})}
              >
                <option>비개발자 입문 (가장 빠른 MVP)</option>
                <option>주니어 개발자 (생산성 혁명)</option>
                <option>예비 창업자 (비용 절감 개발)</option>
              </select>
            </div>
            
            <p className="text-xs text-gray-600 text-center px-4 leading-relaxed">
              신청 시 개인정보 수집 및 마케팅 활용(특강 안내 및 할인 혜택 발송)에 동의하게 됩니다.
            </p>

            <button 
              type="submit"
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
            >
              특강 신청하고 가이드북 받기 <Send size={20} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
"use client";
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Award, Briefcase, GraduationCap, MessageCircle, Star, Zap, Users } from 'lucide-react';

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 font-sans">
      <Navbar />

      <main className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-[4rem] overflow-hidden relative group shadow-3xl dark:shadow-none border dark:border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-slate-200 dark:text-slate-800">
                  <Users size={120} className="opacity-20" />
                </div>
                <div className="absolute bottom-12 left-12 z-20 text-white">
                  <h2 className="text-5xl font-black mb-2">VIBE MASTER</h2>
                  <p className="text-xl font-bold opacity-80 tracking-widest uppercase">Lead Instructor</p>
                </div>
                <div className="absolute top-12 right-12 z-20">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Zap size={32} fill="white" className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase mb-6 block">Instructor Profile</span>
              <h1 className="text-6xl font-black tracking-tighter mb-10 leading-tight dark:text-white">
                당신의 성장을 설계하는 <br />
                실전형 마스터
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed mb-12 italic">
                "코딩은 목적이 아닌 수단입니다. 당신의 비즈니스와 아이디어가 세상에 빛을 발할 수 있도록 가장 효율적인 길을 안내합니다."
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: <Award />, text: "글로벌 IT 기업 프로젝트 총괄 15년" },
                  { icon: <Briefcase />, text: "AI 에이전트 기반 자동화 시스템 빌더" },
                  { icon: <GraduationCap />, text: "3,000명 이상의 비전공자 기술 멘토링" },
                  { icon: <MessageCircle />, text: "1:1 밀착 코칭 및 커리어 설계 전문가" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-16 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-black mb-4 tracking-tight dark:text-white">강사에게 직접 상담하기</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">궁금한 점이 있다면 언제든 편하게 물어보세요.</p>
              </div>
              <button className="bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-600 dark:hover:bg-white dark:hover:text-blue-600 transition-all shadow-xl active:scale-95 flex items-center gap-3 shrink-0">
                카카오톡 문의하기 <Star size={24} fill="currentColor" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-[100px] opacity-30 -z-0" />
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BookOpen, CheckCircle2, ShoppingCart,
  Download, Star, ShieldCheck, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EbookLibraryModal from '@/components/EbookLibraryModal';

export default function EbookPage() {
  const router = useRouter();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 font-sans">
      <Navbar />
      <EbookLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />


      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-24 px-6 bg-linear-to-b from-blue-50/50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-8">
                <Sparkles size={14} /> AI 시대의 생존 전략서
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] dark:text-white">
                의도(Intent)가 <br />
                <span className="text-blue-600 dark:text-blue-400">수익</span>이 되는 법
              </h1>
              <p className="text-slate-500 text-xl font-medium leading-relaxed mb-10">
                코딩을 몰라도 괜찮습니다. AI를 도구로 사용하여 <br className="hidden md:block" />
                당신의 아이디어를 실제 상용 서비스로 변환하는 <br className="hidden md:block" />
                '바이브 코딩'의 정수를 한 권에 담았습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsLibraryOpen(true)}
                  className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95"
                >
                  전자책 라이브러리 <ShoppingCart size={24} />
                </button>
                <div className="flex items-center gap-4 px-6 text-slate-400 font-bold">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} /> 4.9/5.0 (1,200+ 구매)
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="relative z-10 w-full aspect-3/4 bg-slate-900 dark:bg-slate-800 rounded-4xl shadow-3xl dark:shadow-none flex flex-col justify-end p-12 overflow-hidden group border-8 border-slate-800 dark:border-slate-700">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/30 to-transparent" />
                <BookOpen size={120} className="text-blue-500 mb-8 absolute top-12 left-12 opacity-50" />
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-white mb-4 italic leading-tight">VIBE CODING:<br />THE MASTERPIECE</h2>
                  <p className="text-slate-400 font-bold">BY VIBE_EDU TEAM</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-30" />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full blur-[80px] opacity-20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- WHAT'S INSIDE --- */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 dark:text-white">무엇을 배우게 되나요?</h2>
            <p className="text-slate-400 text-lg font-medium italic">이론이 아닌 실전 위주의 5단계 로드맵</p>
          </div>
          
          <div className="space-y-6">
            {[
              { ch: "01", title: "AI-X 패러다임의 이해", desc: "왜 이제 'How'가 아닌 'What'이 중요한가" },
              { ch: "02", title: "마법의 프롬프트 엔지니어링", desc: "AI가 내 의도를 200% 이해하게 만드는 대화법" },
              { ch: "03", title: "Cursor & v0 실전 가이드", desc: "에이전트 도구를 활용한 광속 개발 프로세스" },
              { ch: "04", title: "Supabase & Vercel 배포", desc: "서버 지식 없이 상용 서비스를 런칭하는 기술" },
              { ch: "05", title: "수익화 및 스케일링 전략", desc: "만든 앱으로 실제 돈을 버는 비즈니스 모델링" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 10 }}
                className="flex items-center gap-8 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xl dark:hover:shadow-none"
              >
                <div className="text-3xl font-black text-blue-600/30 dark:text-blue-400/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors italic">{item.ch}</div>
                <div>
                  <h4 className="text-xl font-black mb-1 dark:text-white">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-32 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ShieldCheck className="mx-auto mb-8 text-blue-400" size={64} />
          <h2 className="text-5xl font-black text-white mb-8">지금 바로 시작하세요.</h2>
          <p className="text-slate-400 text-xl mb-12 leading-relaxed">
            한 번의 구매로 평생 업데이트되는 바이브 코딩 가이드를 소유하세요. <br />
            실패 없는 개발의 길을 제시합니다.
          </p>
          
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 inline-block text-left max-w-md w-full">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-black tracking-widest uppercase mb-4 block">Special Launch Price</span>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-5xl font-black italic tracking-tighter dark:text-white">₩29,000</span>
              <span className="text-slate-300 dark:text-slate-600 line-through text-2xl font-bold mb-1">₩49,000</span>
            </div>
            <ul className="space-y-4 mb-10">
              {["PDF 가이드북 (200P+)", "실전 프롬프트 템플릿 30선", "평생 무료 업데이트", "커뮤니티 입장권"].map((text, i) => (
                <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 font-bold items-center">
                  <CheckCircle2 size={18} className="text-blue-500 dark:text-blue-400" /> {text}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
            >
              가이드북 구매하기 <Download size={22} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-600/10 to-transparent pointer-events-none" />
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 text-center border-t border-gray-100">
        <p className="text-slate-400 text-sm font-medium">© 2026 VIBE_EDU. All rights reserved.</p>
      </footer>
    </div>
  );
}

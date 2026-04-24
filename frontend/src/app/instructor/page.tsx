"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Menu, X, Award, Code2, Rocket, Heart } from 'lucide-react';

/**
 * [방법 3] 경로 에러 해결을 위해 Navbar를 파일 내부에 직접 정의
 */
function Navbar({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '바이브코딩이란?', href: '/about' },
    { name: '바이브 코딩 도구', href: '/tools' },
    { name: '강사소개', href: '/instructor' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div 
          className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-2 text-white"
          onClick={() => onNavigate('/')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={20} fill="white" />
          </div>
          VIBE_EDU
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-tight text-white">
          {navLinks.map((link) => (
            <button 
              key={link.href} 
              onClick={() => onNavigate(link.href)} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </button>
          ))}
          <button 
            onClick={() => onNavigate('/apply')}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-full text-white transition-all shadow-lg shadow-blue-600/20"
          >
            JOIN US
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-xl font-bold text-white">
              {navLinks.map((link) => (
                <button key={link.href} onClick={() => onNavigate(link.href)} className="text-left">{link.name}</button>
              ))}
              <button onClick={() => onNavigate('/apply')} className="text-left text-blue-500 font-black">JOIN US</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function InstructorPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 font-sans overflow-x-hidden">
      <Navbar onNavigate={handleNavigate} />
      
      <main className="max-w-5xl mx-auto pt-48 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-24"
        >
          {/* 프로필 상단 */}
          <section className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative group">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[3rem] flex items-center justify-center text-6xl font-black italic shadow-2xl">
                V
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white text-black p-4 rounded-2xl font-bold shadow-xl rotate-6 group-hover:rotate-0 transition-transform">
                Master
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-6 flex-1">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                Vibe Coding <span className="text-blue-500 italic">Master</span>
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed font-light">
                "단순한 지식 전달이 아닌, 아이디어를 현실로 만드는 <strong>압도적인 속도</strong>의 경험을 전수합니다."
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {["Next.js", "FastAPI", "Supabase", "AI-X Infrastructure"].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 실무 프로젝트 경험 (Module 1, 4 기반) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-[#111] rounded-[3rem] border border-white/5 space-y-4">
              <Rocket className="text-blue-500 mb-2" size={32} />
              <h3 className="text-2xl font-bold italic tracking-tight">Fam-Log</h3>
              <p className="text-gray-400 leading-relaxed">
                가족 공유 히스토리 웹앱을 바이브 코딩으로 단기간에 구축했습니다. 
                UI 설계부터 데이터베이스 연동까지, AI 에이전트를 지휘하여 상용 수준의 서비스를 만드는 워크플로우의 정수입니다.
              </p>
            </div>
            <div className="p-10 bg-[#111] rounded-[3rem] border border-white/5 space-y-4">
              <Award className="text-purple-500 mb-2" size={32} />
              <h3 className="text-2xl font-bold italic tracking-tight">AI-X Smart Infra</h3>
              <p className="text-gray-400 leading-relaxed">
                컴퓨터 비전과 열화상 센서를 결합한 능동형 보안 시스템을 설계했습니다. 
                복잡한 하드웨어 통합과 데이터 시각화라는 난제를 바이브 코딩으로 해결한 실전 사례를 공유합니다.
              </p>
            </div>
          </section>

          {/* 강의 철학 (Tip 섹션 기반) */}
          <section className="bg-gradient-to-r from-blue-900/20 via-black to-purple-900/20 p-12 rounded-[4rem] border border-white/5">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <Heart className="mx-auto text-pink-500" size={40} />
              <h2 className="text-3xl font-bold">"내가 겪은 에러" 세션</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                AI가 해결하지 못한 특정 버그(예: LightGBM 설치 이슈 등)를 인간의 의도로 어떻게 풀어냈는지 직접 보여드립니다. 
                환경 설정 실패를 원천 방지하는 가이드북과 마법의 프롬프트를 통해, 여러분의 시간 낭비를 0으로 줄여드립니다.
              </p>
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center text-gray-600 text-sm">
        © 2026 VIBE_EDU. Ideas to Reality at the Speed of Vibe.
      </footer>
    </div>
  );
}
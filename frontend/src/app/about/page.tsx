"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Menu, X, CheckCircle2 } from 'lucide-react';

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

        <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-tight">
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

export default function AboutPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 font-sans overflow-x-hidden">
      <Navbar onNavigate={handleNavigate} />
      
      <main className="max-w-4xl mx-auto pt-48 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Module 1: 패러다임의 전환 */}
          <section className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-blue-500 italic">
              "Why Vibe Coding?"
            </h1>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                바이브 코딩은 단순한 기술 스택의 나열이 아닙니다. 
                <strong>"코드 한 줄"</strong>보다 <strong>"전체적인 느낌(Vibe)과 의도"</strong>를 전달하여 AI와 협업하는 새로운 방식입니다.
              </p>
              <div className="p-8 bg-[#111] rounded-[2.5rem] border border-white/5 space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Zap className="text-blue-500" /> Key Mindset
                </h2>
                <p className="italic text-blue-400 text-xl font-medium">
                  "개발자는 이제 '작가'가 아닌 '감독(Director)'이다."
                </p>
                <p className="text-gray-400 leading-relaxed">
                  구현(Implementation)에 매몰되던 과거에서 벗어나, 의도(Intent) 중심으로 이동하여 
                  AI가 가장 잘하는 일을 수행하도록 지휘하는 능력이 핵심입니다.
                </p>
              </div>
            </div>
          </section>

          {/* Module 3: 바이브를 전달하는 기술 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-200">Context Injection</h3>
              <p className="text-gray-400">
                단순한 명령이 아닙니다. "이 앱은 Notion 스타일의 협업 툴이야"라고 
                AI에게 배경을 먼저 설정하여 결과물의 퀄리티를 비약적으로 높입니다.
              </p>
            </div>
            <div className="space-y-4 text-right">
              <h3 className="text-2xl font-bold text-gray-200">Iterative Refinement</h3>
              <p className="text-gray-400">
                한 번에 완성하는 것이 아니라, 지속적인 피드백 루프를 통해 
                디테일을 다듬어가는 반복적 개선의 미학을 다룹니다.
              </p>
            </div>
          </section>

          {/* Module 5: 인간의 역할 */}
          <section className="border-t border-white/5 pt-16">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-10 rounded-[3rem] border border-blue-500/10">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-widest text-center">The Golden Rule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <CheckCircle2 className="text-blue-500 shrink-0" />
                  <p className="text-gray-300">거대 시스템의 뼈대를 세우는 아키텍처 설계 능력</p>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-blue-500 shrink-0" />
                  <p className="text-gray-300">AI의 할루시네이션(Hallucination)을 관리하는 비판적 시각</p>
                </div>
              </div>
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
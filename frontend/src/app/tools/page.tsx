"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Database 아이콘을 추가했습니다.
import { Zap, Menu, X, Globe, Terminal, Cpu, Layout, Database } from 'lucide-react'; 

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

export default function ToolsPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 font-sans overflow-x-hidden">
      <Navbar onNavigate={handleNavigate} />
      
      <main className="max-w-6xl mx-auto pt-48 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white">
              The <span className="text-blue-500">Toolstack</span>
            </h1>
            <p className="text-gray-400 text-xl font-light">아이디어를 현실로 구현하는 3대 핵심 도구</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 초급 도구 */}
            <div className="p-10 bg-[#111] rounded-[3rem] border border-white/5 hover:border-blue-500/30 transition-all space-y-6">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Globe size={32} />
              </div>
              <h2 className="text-3xl font-bold">초급 (Web-based)</h2>
              <div className="space-y-4 text-gray-400">
                <div className="p-4 bg-black/50 rounded-2xl border border-white/5">
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight">v0 / Bolt.new</h4>
                  <p className="text-sm">자연어로 UI/UX를 즉시 생성하고 배포까지 확인합니다.</p>
                </div>
                <div className="p-4 bg-black/50 rounded-2xl border border-white/5">
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight">Replit Agent</h4>
                  <p className="text-sm">아이디어만으로 데이터베이스와 백엔드까지 자동 구축합니다.</p>
                </div>
              </div>
            </div>

            {/* 중/고급 도구 */}
            <div className="p-10 bg-[#111] rounded-[3rem] border border-white/5 hover:border-purple-500/30 transition-all space-y-6">
              <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Terminal size={32} />
              </div>
              <h2 className="text-3xl font-bold">중/고급 (IDE-based)</h2>
              <div className="space-y-4 text-gray-400">
                <div className="p-4 bg-black/50 rounded-2xl border border-white/5">
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight">Cursor AI</h4>
                  <p className="text-sm">프로젝트 전체 문맥을 이해하는 바이브 코딩의 표준 도구입니다.</p>
                </div>
                <div className="p-4 bg-black/50 rounded-2xl border border-white/5">
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight">Claude Code / Windsurf</h4>
                  <p className="text-sm">터미널 명령과 연동하여 능동적으로 코드를 수정하는 에이전트입니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 시너지 스택 섹션 */}
          <section className="pt-10">
            <div className="bg-gradient-to-r from-blue-900/20 via-black to-purple-900/20 p-12 rounded-[3.5rem] border border-white/5 text-center">
              <h3 className="text-2xl font-bold mb-8 italic tracking-tight">Vibe Coding Synergy Stack</h3>
              <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:border-blue-500/50 transition-colors">
                  <Layout size={18} className="text-blue-400" /> <span className="font-bold">Next.js</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:border-green-500/50 transition-colors">
                  <Cpu size={18} className="text-green-400" /> <span className="font-bold">FastAPI</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:border-orange-500/50 transition-colors">
                  {/* 이제 여기서 에러가 나지 않습니다. */}
                  <Database size={18} className="text-orange-400" /> <span className="font-bold">Supabase</span>
                </div>
              </div>
              <p className="mt-8 text-sm text-gray-500 italic">사용자님은 이미 바이브 코딩과 궁합이 가장 좋은 스택을 활용하고 계십니다.</p>
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
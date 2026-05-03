"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Menu, X, Zap, Sun, Moon } from 'lucide-react';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 마그네틱 텍스트: 마우스에 반응하여 부드럽게 밀려남
 */
export function MagneticText({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.2); 
    y.set((clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.span ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ x, y, display: 'inline-block' }} className={className}>
      {children}
    </motion.span>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // 테마 초기화 및 적용
  useEffect(() => {
    const savedTheme = localStorage.getItem('vibe-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserId('');
      return;
    }

    setIsLoggedIn(true);
    const payload = parseJwtPayload(token);
    setIsAdmin(Boolean(payload?.is_admin));
    setUserId(typeof payload?.sub === 'string' ? payload.sub : '');
  }, [pathname]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserId('');
      onNavigate('/');
      return;
    }

    onNavigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('vibe-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onNavigate = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // 홈이 아닌 페이지에서는 항상 배경이 있는 상태로 유지하여 가독성 확보
  const navBg = (!isHomePage || isScrolled) 
    ? 'py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-100 dark:border-slate-800' 
    : 'py-8 bg-transparent';

  const menuItems = [
    { name: '바이브코딩이란?', path: '/about' },
    { name: '바이브 코딩 도구', path: '/tools' },
    { name: 'AI 코딩툴 찾기', path: '/test' },
    { name: '강사소개', path: '/instructor' },
    { name: '전자책 구매', path: '/ebook' },
    { name: '후기 작성', path: '/reviews' },
    ...(isAdmin ? [{ name: '전자책 관리', path: '/admin/manage' }] : []),
  ];

  return (
    <>
      {/* 최상단 유틸리티 바 (데스크탑 전용) */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-60 h-8 bg-slate-100 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 px-6 justify-end items-center gap-6">
        {isLoggedIn && userId && (
          <span className="text-slate-500 dark:text-slate-400">{userId} 로그인 상태입니다 ({isAdmin ? '관리자' : '일반유저'})</span>
        )}
        {isAdmin && (
          <button onClick={() => onNavigate('/admin/manage')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">전자책 관리</button>
        )}
        <button onClick={handleAuthClick} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{isLoggedIn ? 'Log out' : 'Log in'}</button>
        <button onClick={() => onNavigate('/terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">회원약관</button>
        <button onClick={() => onNavigate('/qna')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">QnA</button>
        <button onClick={() => onNavigate('/chatbot')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 챗봇 문의
        </button>
      </div>

      <nav className={`fixed top-0 lg:top-8 left-0 right-0 z-50 transition-all duration-500 px-6 ${navBg}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* 로고 영역 */}
          <div className="flex items-center gap-10">
            <div onClick={() => onNavigate('/')} className="flex items-center gap-2 cursor-pointer group">
              <MagneticText className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <Zap size={18} fill="white" className="text-white" />
                </div>
                <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">배불뚝이 코딩</span>
                <Sparkles size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
              </MagneticText>
            </div>

            {/* 메인 로고 옆 특별 버튼 - 테마 대응 가시성 확보 */}
            <button 
              onClick={() => onNavigate('/test')}
              className="hidden md:flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-cyan-400 text-sm font-black hover:scale-105 hover:border-blue-500 transition-all shadow-sm group relative overflow-hidden active:scale-95"
            >
              <span className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
              <Sparkles size={16} className="animate-pulse" />
              AI 코딩툴 찾기
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </div>
            </button>
          </div>

          {/* 데스크탑 메뉴 탭 */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-tight">
            {menuItems.filter(item => item.path !== '/test').map((item, i) => (
              <button key={i} onClick={() => onNavigate(item.path)} 
                className={`relative transition-colors flex items-center gap-1 ${pathname === item.path ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'}`}>
                {item.name}
              </button>
            ))}
            
            {/* 테마 토글 버튼 */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button onClick={() => onNavigate('/signup')} 
              className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-600 dark:hover:bg-white dark:hover:text-blue-600 transition-all shadow-md active:scale-95 ml-4">JOIN US</button>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="text-slate-900 dark:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 오버레이 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-950 pt-32 px-6 flex flex-col gap-8"
          >
            {menuItems.map((item, i) => (
              <button key={i} onClick={() => onNavigate(item.path)} 
                className="text-2xl font-black text-left text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                {item.name}
                {item.path === '/test' && (
                  <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full animate-pulse">NEW</span>
                )}
              </button>
            ))}
            
            <div className="mt-auto flex flex-col gap-5 border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                {isLoggedIn && userId && (
                  <span>{userId} 로그인 상태입니다 ({isAdmin ? '관리자' : '일반유저'})</span>
                )}
                <button onClick={handleAuthClick} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{isLoggedIn ? 'Log out' : 'Log in'}</button>
                <button onClick={() => onNavigate('/terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">회원약관</button>
                <button onClick={() => onNavigate('/qna')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">QnA</button>
                <button onClick={() => onNavigate('/chatbot')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 챗봇 문의
                </button>
              </div>
              <button onClick={() => onNavigate('/signup')} 
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-200">
                JOIN US NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

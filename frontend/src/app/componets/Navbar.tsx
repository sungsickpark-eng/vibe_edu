"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
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
          className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-2" 
          onClick={() => router.push('/')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={20} fill="white" />
          </div>
          VIBE_EDU
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold">
          {navLinks.map((link) => (
            <button 
              key={link.href} 
              onClick={() => router.push(link.href)} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </button>
          ))}
          <button 
            onClick={() => router.push('/apply')} 
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-full text-white shadow-lg shadow-blue-600/20"
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
            <div className="px-6 py-8 flex flex-col gap-6 text-xl font-bold">
              {navLinks.map((link) => (
                <button key={link.href} onClick={() => { router.push(link.href); setIsMobileMenuOpen(false); }} className="text-left">{link.name}</button>
              ))}
              <button onClick={() => { router.push('/apply'); setIsMobileMenuOpen(false); }} className="text-left text-blue-500">JOIN US</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
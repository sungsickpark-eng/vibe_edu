"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Zap, ArrowRight, CheckCircle2, PlayCircle,
  Laptop, Database, Layout, Lightbulb, 
  AlertTriangle, Globe, Terminal, Menu, X
} from 'lucide-react';

/**
 * [신규] 마그네틱 텍스트 컴포넌트
 * 마우스 커서가 근처에 오면 글자가 자석처럼 밀려나거나 끌려오는 효과
 */
function MagneticText({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // 마우스와의 거리에 따라 반응 (0.3은 민감도 조절)
    x.set(distanceX * 0.3); 
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.span>
  );
}

/**
 * [방법 3] 경로 에러 방지를 위해 Navbar를 내부에 직접 정의
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
            className="md:hidden bg-black border-b border-white/10 overflow-hidden text-white"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-xl font-bold">
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

export default function VibeEduFullLanding() {
  const router = useRouter();
  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 font-sans overflow-x-hidden">
      
      <Navbar onNavigate={handleNavigate} />

      {/* --- SECTION 1: HERO (마그네틱 타이포그래피 적용) --- */}
      <header className="relative pt-48 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-none cursor-default">
            <MagneticText className="block">IDEAS TO</MagneticText>
            <MagneticText className="text-blue-500">REALITY</MagneticText><br/>
            <span className="text-xs md:text-sm opacity-20 block my-6 uppercase tracking-[1.5em]">at the speed of</span>
            <MagneticText className="italic bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">VIBE</MagneticText>
          </h1>
          
          <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-12">
            이제 개발자는 작가가 아닌 <strong>감독(Director)</strong>입니다. <br/>
            아이디어를 현실로 만드는 가장 빠른 호흡을 경험하세요.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => handleNavigate('/apply')}
              className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-2 active:scale-95"
            >
              3시간 무료 특강 신청하기 <ArrowRight size={24} />
            </button>
          </div>
        </motion.div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      </header>

      {/* --- SECTION 2: CORE CONCEPT (Module 1, 3 기반) --- */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-white/5">
        <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -30 }}>
          <h2 className="text-4xl font-bold mb-8 italic text-blue-400 font-mono">"무엇(What)이 아닌 어떤 경험(Experience)을 줄지 설명하라"</h2>
          <div className="space-y-6 text-gray-400 text-lg">
            <p className="flex gap-4 font-medium"><CheckCircle2 className="text-blue-500 shrink-0" /> 구현 중심에서 의도 중심으로의 이동</p>
            <p className="flex gap-4 font-medium"><CheckCircle2 className="text-blue-500 shrink-0" /> 반복적 개선을 통한 피드백 루프</p>
            <p className="flex gap-4 font-medium"><CheckCircle2 className="text-blue-500 shrink-0" /> 아키텍처 설계와 보안은 여전히 인간의 몫</p>
          </div>
        </motion.div>
        <div className="bg-[#111] p-8 rounded-3xl border border-white/5 relative group">
          <div className="absolute -top-6 -right-6 bg-blue-600 p-4 rounded-2xl rotate-12 group-hover:rotate-0 transition-transform">
            <Lightbulb size={32} />
          </div>
          <h4 className="text-xl font-bold mb-4 text-blue-400">Vibe coding Golden Rule</h4>
          <p className="text-gray-500 leading-relaxed italic">
            "이 앱은 Notion 스타일의 협업 툴이야"라고 배경을 먼저 설정하고, AI가 실수하지 않게 만드는 기술을 배웁니다.
          </p>
        </div>
      </section>

      {/* --- SECTION 3: TOOLSTACK (Module 2 기반) --- */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16 text-white uppercase tracking-widest">Toolstack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-[#111] rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all text-left">
              <Globe className="mb-6 text-blue-500" size={40} />
              <h3 className="text-2xl font-bold mb-4 text-gray-200">초급 (Web-based)</h3>
              <ul className="text-gray-500 space-y-2 text-sm">
                <li>• v0 / Bolt.new: UI/UX 즉시 생성 및 배포</li>
                <li>• Replit Agent: 데이터베이스와 백엔드 자동 구축</li>
              </ul>
            </div>
            <div className="p-10 bg-[#111] rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all text-left">
              <Terminal className="mb-6 text-purple-500" size={40} />
              <h3 className="text-2xl font-bold mb-4 text-gray-200">중/고급 (IDE-based)</h3>
              <ul className="text-gray-500 space-y-2 text-sm">
                <li>• Cursor AI: 프로젝트 문맥 이해의 표준</li>
                <li>• Claude Code / Windsurf: 능동적으로 코드를 수정하는 에이전트</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: CURRICULUM JOURNEY --- */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter italic text-blue-500 italic">Curriculum Journey</h2>
          <p className="text-gray-400 text-lg">결과물이 즉각적으로 눈에 보이는 압도적 성취감</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <CourseCard 
            step="STEP 01" title="3시간 무료 맛보기" price="FREE" icon={<PlayCircle />}
            features={["에이전트 시연 및 비전 제시", "10분 만에 모바일 명함 배포", "코딩 공포심 제거 및 자신감 고취"]}
            buttonText="맛보기 강의 신청" highlight={false} onClick={() => handleNavigate('/apply')}
          />
          <CourseCard 
            step="STEP 02" title="3일 기초 과정" price="유료 과정" icon={<Layout />}
            features={["Next.js 프론트엔드 정복", "Supabase 데이터 저장 및 로그인", "Vercel 최종 배포 자동화"]}
            buttonText="기초 과정 등록" highlight={true} onClick={() => handleNavigate('/apply')}
          />
          <CourseCard 
            step="STEP 03" title="5일 심화 과정" price="마스터 과정" icon={<Database />}
            features={["FastAPI 커스텀 백엔드 설계", "인프라 대시보드 시각화", "결제 시스템 연동 및 수익화 전략"]}
            buttonText="심화 과정 도전" highlight={false} onClick={() => handleNavigate('/apply')}
          />
        </div>
      </section>

      {/* --- SECTION 5: UP-SELLING --- */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-b border-white/5">
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-12 rounded-[3.5rem] text-center shadow-2xl">
          <AlertTriangle className="mx-auto mb-6 text-yellow-500" size={48} />
          <h3 className="text-3xl font-bold mb-6">"방금 만든 앱, 실제로 사람들이 가입하게 만들고 싶지 않으신가요?"</h3>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            무료 강의에서 만든 결과물은 '껍데기'일 뿐입니다.<br/>
            전문성과 수익화를 위해 앱에 <strong>지능</strong>을 이식하는 과정을 시작하세요.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="bg-black/50 px-8 py-4 rounded-2xl border border-white/10">
              <span className="text-sm text-gray-500 block mb-1 uppercase tracking-widest font-bold">수강생 혜택</span>
              <span className="text-2xl font-bold text-blue-400">기초 과정 20% 할인권</span>
            </div>
            <button onClick={() => handleNavigate('/apply')} className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-200 active:scale-95 transition-all shadow-xl">
              할인권 받고 참여하기
            </button>
          </div>
        </div>
      </section>

      <footer className="py-24 text-center bg-black/30">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <p className="text-blue-400 font-black italic tracking-widest mb-2">💡 Vibe Coding Master's Tip</p>
          <p className="text-gray-300">마법의 프롬프트 템플릿과 가이드북을 제공하여 환경 설정 실패를 원천 방지합니다.</p>
          <p className="text-sm text-gray-500 opacity-80 leading-loose">
            실제 <strong>Fam-Log</strong> 개발 사례를 통해 1시간 만에 MVP를 완성하는 워크플로우를 직접 확인하세요.<br/>
            사용자님의 <strong>AI-X 인프라 시스템</strong> 아키텍처를 기반으로 한 실전형 교육을 지향합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CourseCard({ step, title, price, icon, features, buttonText, highlight, onClick }: any) {
  return (
    <motion.div whileHover={{ y: -10 }} className={`p-10 rounded-[3rem] border ${highlight ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-[#111]'} flex flex-col h-full transition-all duration-300`}>
      <div className="mb-8">
        <span className="text-blue-500 text-xs font-black tracking-[0.2em] mb-4 block uppercase font-bold">{step}</span>
        <div className="flex items-center gap-3 mb-2 text-white">
          <div className="text-blue-400">{icon}</div>
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="text-4xl font-black mb-8 italic tracking-tighter text-white">{price}</div>
      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex gap-3 text-sm text-gray-400 font-medium">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" /> {f}
          </li>
        ))}
      </ul>
      <button onClick={onClick} className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'}`}>
        {buttonText}
      </button>
    </motion.div>
  );
}
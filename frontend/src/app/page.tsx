"use client";
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Zap, ArrowRight, CheckCircle2, PlayCircle,
  Database, Layout, Lightbulb, Star,
  AlertTriangle, Globe, Terminal, Menu, X, Sparkles
} from 'lucide-react';
import Navbar, { MagneticText } from '@/components/Navbar';

function CourseCard({ step, title, price, icon, features, buttonText, highlight, onClick }: any) {
  return (
    <motion.div whileHover={{ y: -15 }} 
      className={`p-10 rounded-[3.5rem] border transition-all duration-500 flex flex-col h-full shadow-lg ${
        highlight ? 'border-blue-500 bg-white dark:bg-slate-900 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900'
      }`}>
      <div className="mb-10">
        <span className="text-blue-600 dark:text-blue-400 text-xs font-black tracking-widest mb-4 block uppercase">{step}</span>
        <div className="flex items-center gap-4 mb-4">
          <div className={`${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>{icon}</div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">{price}</div>
      </div>
      <ul className="space-y-5 mb-12 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-600 mt-1.5 shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <button onClick={onClick} 
        className={`w-full py-5 rounded-3xl font-black text-lg transition-all active:scale-95 ${
          highlight ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-slate-900' : 'bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white'
        }`}>
        {buttonText}
      </button>
    </motion.div>
  );
}

export default function VibeEduFullLanding() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const handleNavigate = (path: string) => router.push(path);

  // 테마 변경 감지
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme(); // 초기 확인
    
    // MutationObserver를 사용하여 html 클래스 변경 감지
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const maskName = (str: string) => {
    if (!str) return '';
    const mid = Math.floor(str.length / 2);
    return str.split('').map((char, i) => (i === mid ? char : '*')).join('');
  };

  const maskEmail = (str: string) => {
    if (!str || !str.includes('@')) return '';
    const [id, domain] = str.split('@');
    const domainParts = domain.split('.');
    const ext = domainParts.pop();
    return `${id.charAt(0)}***@***.${ext}`;
  };

  const reviews = [
    { name: '김철수', email: 'chul@naver.com', target: 'course', rating: 5, comment: '정말 인생 강의였습니다! AI를 이렇게 쉽게 배울 수 있다니 놀라워요.' },
    { name: '이영희', email: 'young@gmail.com', target: 'ebook', rating: 4, comment: '전자책 내용이 아주 알차요. 실무에 바로 적용하기 좋습니다.' },
    { name: '박지민', email: 'jimin@kakao.com', target: 'course', rating: 5, comment: '코딩 공포증이 사라졌습니다. 이제 직접 서비스를 만듭니다.' },
    { name: '최윤서', email: 'yoon@outlook.com', target: 'ebook', rating: 5, comment: '가격 대비 가치가 엄청납니다. 무조건 추천해요.' },
    { name: '정현우', email: 'hyun@vibe.edu', target: 'course', rating: 5, comment: '실무 위주의 커리큘럼이 너무 마음에 듭니다.' }
  ];

  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    isDark ? ["#020617", "#0f172a"] : ["#ffffff", "#f8fafc"]
  );

  return (
    <motion.div style={{ backgroundColor }} className="min-h-screen text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 font-sans overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <header className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-8 border border-blue-100">
              <Sparkles size={14} /> AI-X 기반 차세대 개발 패러다임
            </span>
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] text-slate-900 dark:text-white">
              <MagneticText className="block">IDEAS TO</MagneticText>
              <MagneticText className="text-blue-600 dark:text-blue-400">REALITY</MagneticText>
            </h1>
            <p className="text-slate-500 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-12">
              개발자는 이제 코드를 쓰는 작가가 아닌, <br className="hidden md:block" /> 
              의도를 지휘하는 <span className="text-olive-500 font-bold underline underline-offset-4 decoration-olive-400">감독(Director)</span>입니다.
            </p>
            <button onClick={() => handleNavigate('/apply')} 
              className="bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-olive-500 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-3 mx-auto">
              3시간 무료 특강 신청하기 <ArrowRight size={24} />
            </button>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-200 h-200 bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60" />
      </header>

      {/* --- CORE CONCEPT --- */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl font-black mb-8 leading-tight">"무엇(What)이 아닌<br />경험(Experience)을 말하세요"</h2>
            <div className="space-y-6">
              {[
                "구현(How) 중심에서 의도(Intent) 중심으로",
                "지속적인 피드백 루프를 통한 완성",
                "인간은 설계와 보안의 최후 보루"
              ].map((text, i) => (
                <div key={i} className="flex gap-4 items-center group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-lg font-semibold text-slate-600">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl shadow-blue-100/50 dark:shadow-none border border-blue-50 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 rounded-bl-[100px] transition-all group-hover:w-40 group-hover:h-40" />
            <Lightbulb size={48} className="text-blue-600 dark:text-blue-400 mb-8" />
            <h4 className="text-2xl font-black mb-4 text-slate-900 dark:text-white italic">Vibe Golden Rule</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-medium">
              "Notion 스타일의 협업 툴이야"라고 배경(Context)을 먼저 설정하세요. AI가 실수하지 않는 최강의 프롬프트 기술입니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- PORTFOLIO SECTION --- */}
      <section className="relative max-w-3xl mx-auto px-6 py-32">
        <div className="text-center mb-32">
          <h2 className="text-7xl font-black mb-6 tracking-tight">Project Flow</h2>
          <p className="text-slate-400 text-xl font-medium">단절 없는 성취의 기록, 바이브 에듀의 프로젝트 여정</p>
        </div>

        <div className="flex flex-col -space-y-1">
          {[1, 2, 3, 5, 6].map((num, i) => (
            <motion.div key={num} initial={{ opacity: 0.8 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.8 }} className="relative w-full group">
              <div className={`relative overflow-hidden transition-all duration-700 ${i === 0 ? 'rounded-t-[4rem]' : ''} ${i === 4 ? 'rounded-b-[4rem]' : ''}`}>
                <div className="absolute top-12 left-12 z-20">
                  <span className="px-5 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white font-black text-[10px] shadow-2xl tracking-widest uppercase">
                    Stage 0{i + 1}
                  </span>
                </div>
                <img src={`/images/card${num}.png`} alt={`Project Card ${num}`} className="w-full h-auto object-cover display-block" />
                {i === 4 && <div onClick={() => handleNavigate('/apply')} className="absolute inset-0 cursor-pointer z-30" title="신청하기" />}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- CURRICULUM --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-24">
          <h2 className="text-6xl font-black mb-6 tracking-tight">Curriculum</h2>
          <p className="text-slate-400 text-xl font-medium italic">성취감을 서비스 가치로 연결하는 여정</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CourseCard 
            step="STEP 01" title="3시간 무료 맛보기" price="FREE" icon={<PlayCircle />}
            features={["에이전트(Cursor, v0) 시연", "모바일 명함 10분 배포 실습", "코딩 공포심 제거"]}
            buttonText="입문하기" highlight={false} onClick={() => handleNavigate('/apply')}
          />
          <CourseCard 
            step="STEP 02" title="3일 기초 과정" price="유료 과정" icon={<Layout />}
            features={["Next.js 프론트엔드 정복", "Supabase 데이터 저장/로그인", "Vercel 원클릭 배포"]}
            buttonText="MVP 빌드 시작" highlight={true} onClick={() => handleNavigate('/apply')}
          />
          <CourseCard 
            step="STEP 03" title="5일 심화 과정" price="마스터 과정" icon={<Database />}
            features={["FastAPI 백엔드 설계", "AI Agent & 시스템 지능화", "Docker/K3s 인프라 및 수익화"]}
            buttonText="마스터 도전" highlight={false} onClick={() => handleNavigate('/apply')}
          />
        </div>
      </section>

      {/* --- STUDENT STORIES --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-4">Student Stories</h2>
          <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">수강생의 생생한 목소리</h3>
        </div>

        <div className="relative flex overflow-x-hidden">
          <motion.div animate={{ x: [0, -1035 * 2] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-8 whitespace-nowrap">
            {[...reviews, ...reviews, ...reviews].map((rev, idx) => (
              <div key={idx} className="inline-block w-87.5 p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-blue-50 dark:shadow-none">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{maskName(rev.name)}</div>
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500">{maskEmail(rev.email)}</div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-100 dark:text-slate-800"} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-normal line-clamp-3 italic">
                  "{rev.comment}"
                </p>
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${rev.target === 'course' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                    {rev.target === 'course' ? 'OFFLINE COURSE' : 'E-BOOK'}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="max-w-5xl mx-auto px-6 py-24 mb-32">
        <motion.div whileHover={{ scale: 1.01 }} className="bg-slate-900 p-16 rounded-[4rem] text-center shadow-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-transparent opacity-50" />
          <AlertTriangle className="mx-auto mb-8 text-blue-400" size={56} />
          <h3 className="text-4xl font-black mb-8 text-white">"껍데기 앱은 이제 그만."</h3>
          <p className="text-slate-400 text-xl mb-12 leading-relaxed">
            무료 강의에서 만든 앱에 <strong>지능(DB & 서버)</strong>을 이식하고 <br className="hidden md:block" />
            실제 수익이 발생하는 상용 서비스로 진화시키세요.
          </p>
          <button onClick={() => handleNavigate('/apply')} className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95">
            기초 과정 20% 할인권 받기
          </button>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-24 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="flex justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <p className="text-blue-600 dark:text-blue-400 font-black italic tracking-widest uppercase">Master's Insight</p>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-semibold italic underline decoration-blue-200 dark:decoration-blue-900 underline-offset-8">
            "가이드북과 마법의 프롬프트가 환경 설정의 고통을 없애드립니다."
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            사용자님의 <strong>Fam-Log</strong> 및 <strong>AI-X 인프라 시스템</strong> 구축 사례를 기반으로 설계되었습니다.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
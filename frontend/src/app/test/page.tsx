"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ArrowRight, RefreshCw, ChevronRight, 
  Terminal, Layout, Sparkles, Code2, 
  Cpu, Rocket, CheckCircle2, Globe, Boxes, X, ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// --- Data ---
interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    icon: string;
    scores: Record<string, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "현재 코딩 실력은 어느 정도인가요?",
    options: [
      { label: "코딩이 처음인 완전 입문자", icon: "🌱", scores: { chatgpt: 3, lovable: 4, gamma: 5, bolt: 3 } },
      { label: "기초 문법 정도는 아는 초보자", icon: "📚", scores: { chatgpt: 2, v0: 4, bolt: 4, replit: 3 } },
      { label: "어느 정도 개발 경험이 있는 숙련자", icon: "💻", scores: { cursor: 4, windsurf: 5, claude: 2, antigravity: 3 } },
      { label: "현업에서 일하고 있는 전문가", icon: "🚀", scores: { cursor: 5, devin: 5, copilot: 4, antigravity: 5 } }
    ]
  },
  {
    id: 2,
    question: "주로 어떤 것을 만들고 싶으신가요?",
    options: [
      { label: "웹사이트 UI/프론트엔드 디자인", icon: "🎨", scores: { v0: 5, lovable: 5, bolt: 4, gamma: 3 } },
      { label: "서버, DB 등 백엔드 로직", icon: "⚙️", scores: { cursor: 4, windsurf: 4, chatgpt: 3, devin: 3 } },
      { label: "데이터 분석 및 파이썬 스크립트", icon: "📊", scores: { chatgpt: 4, perplexity: 5, claude: 4, codex: 3 } },
      { label: "모바일 앱 또는 복합 서비스", icon: "📱", scores: { cursor: 5, lovable: 4, replit: 3, devin: 5 } }
    ]
  },
  {
    id: 3,
    question: "AI와 어떻게 협업하고 싶으신가요?",
    options: [
      { label: "AI가 알아서 다 짜주면 좋겠어요", icon: "🤖", scores: { devin: 5, lovable: 4, v0: 4, bolt: 3 } },
      { label: "제가 짜는 코드를 실시간으로 도와주길 원해요", icon: "🤝", scores: { copilot: 5, cursor: 4, windsurf: 5, antigravity: 4 } },
      { label: "복잡한 로직을 함께 고민하고 싶어요", icon: "🧠", scores: { claude: 5, chatgpt: 4, perplexity: 3, antigravity: 5 } },
      { label: "프로젝트 전체 구조를 잡는 걸 도와주면 좋겠어요", icon: "🏗️", scores: { cursor: 5, windsurf: 5, devin: 4, antigravity: 4 } }
    ]
  },
  {
    id: 4,
    question: "선호하는 개발 환경은 무엇인가요?",
    options: [
      { label: "VS Code 같은 전문 IDE", icon: "🖥️", scores: { cursor: 5, windsurf: 5, copilot: 5, antigravity: 4 } },
      { label: "웹 브라우저에서 바로 코딩", icon: "🌐", scores: { lovable: 5, bolt: 5, v0: 4, replit: 5 } },
      { label: "채팅창에서 대화하며 코드 복붙", icon: "💬", scores: { chatgpt: 5, claude: 5, perplexity: 4, codex: 2 } },
      { label: "문서나 발표 자료 형태", icon: "📝", scores: { gamma: 5, chatgpt: 2 } }
    ]
  },
  {
    id: 5,
    question: "도구 선택 시 가장 중요하게 생각하는 것은?",
    options: [
      { label: "압도적인 성능과 정확도", icon: "🎯", scores: { antigravity: 5, claude: 5, cursor: 4, devin: 4 } },
      { label: "사용 편의성과 빠른 결과물", icon: "⚡", scores: { lovable: 5, v0: 5, bolt: 4, gamma: 5 } },
      { label: "지식 검색과 최신 정보", icon: "🔍", scores: { perplexity: 5, chatgpt: 3 } },
      { label: "기존 도구와의 완벽한 통합", icon: "🔗", scores: { copilot: 5, windsurf: 4, cursor: 3 } }
    ]
  },
  {
    id: 6,
    question: "AI 코딩 도구를 통해 얻고 싶은 최종 목표는?",
    options: [
      { label: "나만의 서비스를 빠르게 배포하기", icon: "🚢", scores: { lovable: 5, v0: 5, bolt: 5, replit: 4 } },
      { label: "학습 효율을 극대화하여 실력 쌓기", icon: "📈", scores: { chatgpt: 5, antigravity: 4, claude: 3 } },
      { label: "업무 생산성을 2배 이상 높이기", icon: "🛠️", scores: { cursor: 5, windsurf: 5, devin: 5, copilot: 4 } },
      { label: "코딩 없이 아이디어 구현하기", icon: "✨", scores: { lovable: 5, gamma: 5, v0: 4 } }
    ]
  }
];

const RESULTS = {
  cursor: {
    name: "Cursor (커서)",
    tagline: "현존 최강의 AI 코드 에디터",
    icon: "/images/tools/cursor.svg",
    desc: "VS Code를 기반으로 AI가 내장된 에디터입니다. 코드의 맥락을 완벽히 이해하며, 전체 파일을 넘나드는 수정이 가능합니다. 전문적인 개발 경험을 원한다면 최고의 선택입니다.",
    tags: ["IDE 기반", "코드 맥락 이해", "자동 완성+", "프로젝트 관리"],
    link: "https://cursor.sh"
  },
  windsurf: {
    name: "Windsurf",
    tagline: "Codeium의 차세대 에이전틱 IDE",
    icon: "/images/tools/windsurf.png",
    desc: "강력한 AI 에이전트가 코드를 직접 수정하고 실행하는 차세대 개발 환경입니다. 단순한 제안을 넘어 스스로 문제를 해결하는 능력이 탁월합니다.",
    tags: ["에이전틱 IDE", "실시간 협업", "강력한 성능", "Codeium 기반"],
    link: "https://codeium.com/windsurf"
  },
  lovable: {
    name: "Lovable",
    tagline: "말 한마디로 완성되는 풀스택 앱",
    icon: "/images/tools/lovable.svg",
    desc: "아이디어를 설명하기만 하면 기획부터 디자인, 코드 작성, 배포까지 한 번에 처리합니다. 비개발자도 전문가급 결과물을 만들 수 있는 최고의 툴입니다.",
    tags: ["풀스택 생성", "노코드 친화", "빠른 배포", "고퀄리티 UI"],
    link: "https://lovable.dev"
  },
  bolt: {
    name: "Bolt.new",
    tagline: "브라우저에서 즉시 시작하는 풀스택 개발",
    icon: "/images/tools/bolt.png",
    desc: "환경 설정 없이 브라우저에서 바로 React, Next.js 앱을 생성하고 실행합니다. StackBlitz의 강력한 클라우드 환경을 기반으로 동작합니다.",
    tags: ["즉시 실행", "StackBlitz 기반", "웹 개발 최적화", "실시간 프리뷰"],
    link: "https://bolt.new"
  },
  v0: {
    name: "v0 by Vercel",
    tagline: "디자인부터 배포까지, 프론트엔드 종결자",
    icon: "/images/tools/v0.svg",
    desc: "말만 하면 리액트 UI를 뚝딱 만들어줍니다. 특히 프론트엔드 개발 속도를 비약적으로 높여주며, Vercel과의 연동으로 배포까지 순식간입니다.",
    tags: ["UI 생성", "React/Next.js", "빠른 프로토타이핑", "Vercel 연동"],
    link: "https://v0.dev"
  },
  devin: {
    name: "Devin AI",
    tagline: "세계 최초의 완전 자율형 AI 소프트웨어 엔지니어",
    icon: "/images/tools/devin.svg",
    desc: "스스로 계획을 세우고, 코딩하고, 오류를 수정하며 프로젝트를 완수합니다. 단순 보조를 넘어 실제 팀원처럼 작업하는 혁신적인 AI 에이전트입니다.",
    tags: ["자율 주행 개발", "문제 해결사", "전체 작업 수행", "차세대 AI"],
    link: "https://devin.ai"
  },
  antigravity: {
    name: "Antigravity",
    tagline: "압도적인 성능의 프리미엄 코딩 어시스턴트",
    icon: "/images/tools/antigravity.webp",
    desc: "고성능 개발 워크플로우를 위해 설계된 최상급 AI입니다. 정교한 로직 설계부터 최적화까지, 개발자의 한계를 뛰어넘게 도와주는 최고의 파트너입니다.",
    tags: ["프리미엄 성능", "정교한 로직", "고성능 최적화", "전문가 전용"],
    link: "#"
  },
  perplexity: {
    name: "Perplexity",
    tagline: "지식 검색과 코드 조각의 결합",
    icon: "/images/tools/perplexity.svg",
    desc: "실시간 웹 검색을 통해 최신 라이브러리 사용법이나 코딩 지식을 가장 빠르게 찾아줍니다. 단순 검색을 넘어 실제 적용 가능한 코드 스니펫을 제공합니다.",
    tags: ["실시간 검색", "최신 정보", "코드 조각", "연구 중심"],
    link: "https://perplexity.ai"
  },
  gamma: {
    name: "Gamma",
    tagline: "아이디어를 웹과 프레젠테이션으로",
    icon: "/images/tools/gamma.png",
    desc: "몇 문장만 입력하면 아름다운 웹사이트나 발표 자료를 즉시 만들어줍니다. 개발 지식 없이도 전문가 수준의 결과물을 공유할 수 있게 돕습니다.",
    tags: ["웹/PPT 생성", "빠른 시각화", "디자인 자동화", "협업 도구"],
    link: "https://gamma.app"
  },
  chatgpt: {
    name: "ChatGPT (GPT-4o)",
    tagline: "언제나 든든한 코딩 파트너",
    icon: "/images/tools/openai.svg",
    desc: "가장 대중적이고 다재다능한 AI입니다. 코드 작성뿐만 아니라 오류 해결, 로직 설명, 알고리즘 공부 등 다방면에서 최고의 도움을 줍니다.",
    tags: ["다목적 AI", "오류 디버깅", "개념 설명", "초보자 친화"],
    link: "https://chatgpt.com"
  },
  claude: {
    name: "Claude 3.5 Sonnet",
    tagline: "논리적이고 깔끔한 코드 생성기",
    icon: "/images/tools/claude.svg",
    desc: "최근 개발자들 사이에서 가장 선호되는 AI입니다. 매우 정교하고 논리적인 코드를 생성하며, 특히 복잡한 알고리즘 구현에서 빛을 발합니다.",
    tags: ["고성능 로직", "긴 컨텍스트", "가독성 높은 코드", "최신 모델"],
    link: "https://claude.ai"
  },
  copilot: {
    name: "GitHub Copilot",
    tagline: "내 손끝에서 시작되는 페어 프로그래밍",
    icon: "/images/tools/copilot.svg",
    desc: "가장 익숙한 에디터 환경에서 실시간으로 코드를 제안합니다. 타이핑을 획기적으로 줄여주며, GitHub 생태계와 완벽하게 통합되어 있습니다.",
    tags: ["실시간 제안", "GitHub 연동", "생산성 향상", "표준 도구"],
    link: "https://github.com/features/copilot"
  },
  replit: {
    name: "Replit Agent",
    tagline: "브라우저만 있으면 어디서든 개발 가능",
    icon: "/images/tools/replit.svg",
    desc: "환경 설정의 고통 없이 브라우저에서 바로 앱을 만들고 배포할 수 있습니다. AI 에이전트가 서버 구축부터 배포까지 알아서 해줍니다.",
    tags: ["클라우드 IDE", "환경 설정 필요없음", "AI 에이전트", "즉시 배포"],
    link: "https://replit.com"
  },
  codex: {
    name: "OpenAI Codex",
    tagline: "AI 코딩 시대의 선구자",
    icon: "/images/tools/openai.svg",
    desc: "수많은 AI 도구들의 기반이 된 역사적인 코딩 모델입니다. 다양한 프로그래밍 언어에 대한 깊은 이해도를 바탕으로 코드를 생성합니다.",
    tags: ["기반 모델", "다국어 지원", "원조 코딩 AI", "개발자용"],
    link: "https://openai.com/blog/openai-codex"
  }
};

function RecommendationItem({ tool, score }: { tool: any, score: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/30 hover:border-blue-500/30 transition-colors group shadow-sm text-left"
      >
        <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 bg-white p-2">
          <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{tool.name}</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{tool.tagline}</p>
        </div>
        <div className="text-[10px] font-black text-blue-600 dark:text-blue-500/50 bg-blue-50 dark:bg-blue-500/5 px-2 py-1 rounded-md uppercase">
          MATCH {Math.min(95, Math.max(60, score * 10))}%
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="px-6"
          >
            <div className="py-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-blue-500/20 ml-7 pl-6 my-2">
              {tool.desc}
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] font-bold text-blue-600 dark:text-blue-400/70">#{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TestPage() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<keyof typeof RESULTS | null>(null);
  const [selectedTool, setSelectedTool] = useState<any>(null);

  const startQuiz = () => {
    setScores({});
    setCurrentQuestion(0);
    setStep('quiz');
  };

  const handleOptionClick = (optionScores: Record<string, number>) => {
    const newScores = { ...scores };
    Object.entries(optionScores).forEach(([key, value]) => {
      newScores[key] = (newScores[key] || 0) + value;
    });
    setScores(newScores);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Record<string, number>) => {
    const sorted = Object.entries(finalScores).sort((a, b) => b[1] - a[1]);
    const topResult = sorted[0][0] as keyof typeof RESULTS;
    setResult(topResult);
    setStep('result');
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 transition-colors duration-500">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          
          {/* --- INTRO --- */}
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-500/20 animate-pulse">
                <Cpu size={48} className="text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
                나에게 딱 맞는 <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 dark:from-blue-400 dark:via-cyan-300 dark:to-purple-400">
                  AI 코딩툴
                </span> 찾기
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                복잡한 선택지는 고민하지 마세요. <br className="hidden md:block" />
                나의 니즈에 맞는 최고의 도구를 추천해 드립니다.
              </p>
              <button 
                onClick={startQuiz}
                className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-12 py-6 rounded-2xl font-black text-xl hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto overflow-hidden"
              >
                <span className="relative z-10">테스트 시작하기</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <p className="mt-8 text-slate-400 dark:text-slate-600 text-sm font-bold flex items-center justify-center gap-2">
                <RefreshCw size={14} /> 약 1분 소요
              </p>
            </motion.div>
          )}

          {/* --- QUIZ --- */}
          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-12">
                <span className="text-blue-600 dark:text-blue-500 text-xs font-black tracking-widest uppercase mb-4 block">Question 0{currentQuestion + 1}</span>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                  {QUESTIONS[currentQuestion].question}
                </h3>
              </div>
              <div className="grid gap-4">
                {QUESTIONS[currentQuestion].options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 8, backgroundColor: 'rgba(59,130,246,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionClick(opt.scores)}
                    className="flex items-center gap-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-left transition-all hover:border-blue-500/50 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl group-hover:bg-blue-600 transition-colors shadow-sm">
                      {opt.icon}
                    </div>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white">{opt.label}</span>
                    <ChevronRight size={20} className="ml-auto text-slate-300 dark:text-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- RESULT --- */}
          {step === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-10">
                <span className="text-blue-600 dark:text-blue-500 text-xs font-black tracking-widest uppercase mb-4 block">Your Matching Tool</span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">결과 확인</h1>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 md:p-14 shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/10 rounded-bl-[100px]" />
                
                <div className="w-24 h-24 mb-8 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white p-4">
                  <img src={RESULTS[result].icon} alt={RESULTS[result].name} className="w-full h-full object-contain" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2 italic">
                  {RESULTS[result].name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-8 tracking-tight">{RESULTS[result].tagline}</p>
                
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-slate-600 dark:text-slate-300 leading-relaxed font-medium border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  {RESULTS[result].desc}
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                  {RESULTS[result].tags.map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-200 dark:border-blue-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href={RESULTS[result].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-900/20"
                  >
                    도구 바로가기 <Globe size={20} />
                  </a>
                  <button 
                    onClick={() => setStep('intro')}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-2xl font-black text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                  >
                    다시 테스트하기 <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              {/* Other Recommendations (Runner-ups) - Accordion Style */}
              <div className="mt-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-500" /> 다른 추천 도구들
                </h3>
                <div className="grid gap-4">
                  {Object.entries(scores)
                    .filter(([key]) => key !== result)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([key, score]) => {
                      const tool = RESULTS[key as keyof typeof RESULTS];
                      return <RecommendationItem key={key} tool={tool} score={score} />;
                    })}
                </div>
              </div>

              {/* Bonus CTA */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 p-8 rounded-[2.5rem] bg-slate-900 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-800 text-center flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="text-left text-white">
                  <h4 className="text-xl font-black mb-1">더 체계적으로 배우고 싶다면?</h4>
                  <p className="text-slate-400 font-bold text-sm">바이브 에듀의 3시간 무료 특강을 신청하세요.</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/apply'}
                  className="bg-white text-slate-950 px-8 py-4 rounded-xl font-black hover:bg-blue-500 hover:text-white transition-all shrink-0"
                >
                  무료 특강 신청
                </button>
              </motion.div>

              {/* All Tools Library Section */}
              <div className="mt-20 w-full mb-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">AI Tool Library</h3>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.values(RESULTS)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((tool, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        onClick={() => setSelectedTool(tool)}
                        className="group p-5 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-lg text-center flex flex-col items-center"
                      >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl overflow-hidden bg-white p-3 border border-slate-50 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                          <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                        </div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs mb-1">{tool.name}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium truncate w-full px-1">{tool.tagline}</p>
                        <div className="mt-3 inline-flex items-center gap-1 text-[9px] font-black text-blue-600 dark:text-blue-500 group-hover:translate-x-1 transition-transform">
                          자세히 보기 <ChevronRight size={8} />
                        </div>
                      </motion.button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tool Detail Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header/Decor */}
              <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                <button 
                  onClick={() => setSelectedTool(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors z-10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-8 pb-10 -mt-12 relative z-0">
                <div className="w-24 h-24 rounded-[2rem] bg-white p-5 shadow-xl mb-6 border-4 border-white dark:border-slate-900 mx-auto md:mx-0">
                  <img src={selectedTool.icon} alt={selectedTool.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedTool.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold mb-6">{selectedTool.tagline}</p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm border border-slate-100 dark:border-slate-800 shadow-inner">
                    {selectedTool.desc}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10 justify-center md:justify-start">
                    {selectedTool.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <a 
                      href={selectedTool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                      공식 사이트 방문 <ExternalLink size={18} />
                    </a>
                    <button 
                      onClick={() => setSelectedTool(null)}
                      className="px-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <div className="py-10 text-center text-slate-400 dark:text-slate-700 text-xs font-bold tracking-widest uppercase">
        VIBE EDU © 2026 AI-X PARADIGM
      </div>
    </div>
  );
}

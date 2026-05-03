"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { ChevronRight, X, ExternalLink } from 'lucide-react';

const TOOLS_DATA = {
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

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<any>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 font-sans">
      <Navbar />

      <main className="pt-40 pb-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-4">The Stack</h2>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">Vibe Coding Tools</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              도구가 좋으면 고생이 줄어듭니다. <br />
              바이브 에듀가 엄선한 AI 시대의 최강 도구 모음을 한눈에 확인하세요.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Object.values(TOOLS_DATA)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((tool, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => setSelectedTool(tool)}
                  className="group p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-xl hover:-translate-y-1 text-center flex flex-col items-center shadow-sm"
                >
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl overflow-hidden bg-white p-3 border border-slate-50 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                    <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm mb-2">{tool.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 w-full px-1 leading-relaxed">{tool.tagline}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-500 group-hover:translate-x-1 transition-transform">
                    자세히 보기 <ChevronRight size={10} />
                  </div>
                </motion.button>
              ))}
          </div>

          <div className="mt-32 p-16 rounded-[4rem] bg-blue-600 dark:bg-blue-700 text-white text-center shadow-2xl">
            <h3 className="text-3xl font-black mb-6 italic">"Tools are just an extension of your intent."</h3>
            <p className="text-blue-100 font-bold opacity-80">도구는 당신의 의도를 실현하는 확장일 뿐입니다. 중요한 건 당신의 아이디어입니다.</p>
          </div>
        </div>
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
              <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
                <button 
                  onClick={() => setSelectedTool(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors z-10"
                >
                  <X size={20} />
                </button>
              </div>

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
    </div>
  );
}
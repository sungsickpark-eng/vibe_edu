"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Zap, Target, Rocket, Users, Sparkles, X } from 'lucide-react';

export default function AboutPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 font-sans">
      <Navbar />

      <main className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 히어로 섹션 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black mb-8 border border-blue-100 dark:border-blue-800">
              <Zap size={14} /> PHILOSOPHY
            </span>
            <h1 className="text-6xl font-black tracking-tighter mb-8 leading-tight dark:text-white">
              코딩은 기술이 아니라 <br />
              <span className="text-blue-600 dark:text-blue-400">비즈니스의 언어</span>입니다.
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">
              우리는 단순히 문법을 가르치지 않습니다. <br />
              아이디어를 실제 가치로 변환하는 '의도 중심 개발'을 지향합니다.
            </p>
          </motion.div>

          {/* 핵심 가치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            {[
              { icon: <Target className="text-blue-600" />, title: "의도 중심 (Intent-First)", desc: "어떻게(How) 짤 것인가보다 무엇(What)을 만들 것인가에 집중합니다." },
              { icon: <Rocket className="text-blue-600" />, title: "초고속 구현 (Hyper-Growth)", desc: "AI 에이전트를 활용하여 개발 속도를 10배 이상 끌어올립니다." },
              { icon: <Users className="text-blue-600" />, title: "실전 지향 (Real-World)", desc: "작동하는 코드를 넘어, 수익이 발생하는 상용 서비스를 만듭니다." },
              { icon: <Sparkles className="text-blue-600" />, title: "한계 돌파 (Breakthrough)", desc: "비전공자도 시스템 아키텍처를 설계할 수 있는 시대를 엽니다." }
            ].map((v, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-none transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white">{v.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 비전 섹션 */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-slate-900 rounded-[4rem] p-16 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
            <h2 className="text-4xl font-black mb-8 relative z-10">AI와 함께 춤추는 개발자</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-0 relative z-10">
              바이브 에듀는 인공지능을 경쟁자가 아닌 가장 강력한 조력자로 활용합니다. <br />
              우리의 목표는 모든 수강생이 자신만의 '디지털 제국'을 건설하는 것입니다.
            </p>
          </motion.div>
        </div>
      </main>

      {/* 준비물 섹션 (Carousel) */}
      <section className="pb-32 overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">바이브 코딩을 시작하기 위한 준비물</h2>
        </div>
        <div className="relative flex overflow-x-hidden">
          <motion.div 
            animate={{ x: [0, -2618] }} // (350 width + 24 gap) * 7 images = 2618
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
            className="flex gap-6 whitespace-nowrap pl-6"
          >
            {[1,2,3,4,5,6,7, 1,2,3,4,5,6,7, 1,2,3,4,5,6,7].map((num, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage(num)}
                className="w-[350px] shrink-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <img src={`/images/vibe_coding/cardnews_0${num}.png`} alt={`Vibe Coding ${num}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors z-20 backdrop-blur-md"
              >
                <X size={20} />
              </button>
              <img 
                src={`/images/vibe_coding/cardnews_0${selectedImage}.png`} 
                alt={`Vibe Coding ${selectedImage}`} 
                className="w-full h-auto object-contain max-h-[90vh] bg-slate-900" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-20 text-center border-t border-gray-100">
        <p className="text-slate-400 text-sm font-medium">© 2026 VIBE_EDU. Philosophy of Future Development.</p>
      </footer>
    </div>
  );
}
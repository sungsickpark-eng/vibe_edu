"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Star, MessageSquare, Send, 
  CheckCircle2, BookOpen, PlayCircle, Sparkles 
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ReviewsPage() {
  const router = useRouter();
  const [target, setTarget] = useState<'course' | 'ebook'>('course');
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([
    { name: '김철수', email: 'chul@naver.com', target: 'course', rating: 5, comment: '정말 인생 강의였습니다! AI를 이렇게 쉽게 배울 수 있다니 놀라워요.', date: '2026.04.28' },
    { name: '이영희', email: 'young@gmail.com', target: 'ebook', rating: 4, comment: '전자책 내용이 아주 알차요. 실무에 바로 적용하기 좋습니다.', date: '2026.04.27' }
  ]);

  // 마스킹 로직
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !comment.trim()) return;
    
    const newReview = {
      name, email, target, rating, comment,
      date: new Date().toLocaleDateString('ko-KR')
    };

    setReviews([newReview, ...reviews]);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setEmail('');
      setComment('');
      setRating(5);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 font-sans">
      <Navbar />

      <main className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl font-black mb-4 tracking-tight dark:text-white">수강 후기 작성</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">당신의 소중한 경험이 누군가에게는 새로운 시작이 됩니다.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* 왼쪽: 후기 작성 폼 */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="lg:col-span-3 bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-100/50 dark:shadow-none border border-blue-50 dark:border-slate-800 relative overflow-hidden h-fit">
              
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} className="space-y-8">
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">성함</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all font-bold dark:text-white outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">이메일</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@vibe.com"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all font-bold dark:text-white outline-none" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">리뷰 항목</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setTarget('course')}
                          className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                            target === 'course' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-blue-200'
                          }`}>
                          <PlayCircle size={18} /> 오프라인 강의
                        </button>
                        <button type="button" onClick={() => setTarget('ebook')}
                          className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                            target === 'ebook' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-blue-200'
                          }`}>
                          <BookOpen size={18} /> 전자책 구매
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">만족도 별점</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)} className="transition-transform active:scale-90">
                            <Star size={30} className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-700"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">상세 후기</label>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="경험을 자유롭게 들려주세요."
                        className="w-full h-32 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all font-medium resize-none outline-none dark:text-white"
                      />
                    </div>

                    <button type="submit" 
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-900 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                      후기 등록하기 <Send size={20} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-black italic dark:text-white">리뷰 등록 완료!</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">소중한 의견 감사합니다.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 오른쪽: 최근 리뷰 목록 */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2 mb-8 uppercase tracking-tighter dark:text-white">
                <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} /> Recent Stories
              </h3>
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
                {reviews.map((rev, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">{maskName(rev.name)}</div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{maskEmail(rev.email)}</div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-700"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3 mb-4">{rev.comment}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${rev.target === 'course' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400'}`}>
                        {rev.target === 'course' ? '강의 후기' : '전자책 후기'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">{rev.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* 하단 장식 요소 */}
          <div className="mt-20 flex justify-center gap-12 text-slate-300 dark:text-slate-700 font-bold italic tracking-tighter">
            <div className="flex items-center gap-2"><Sparkles size={16} /> Best Feedback</div>
            <div className="flex items-center gap-2"><MessageSquare size={16} /> Community Driven</div>
          </div>
        </div>
      </main>
    </div>
  );
}

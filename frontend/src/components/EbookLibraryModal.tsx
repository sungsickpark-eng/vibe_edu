import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ShoppingCart, CheckCircle2, PlayCircle } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

interface Lecture {
  id: number;
  title: string;
  description: string;
  category: string;
  cover_image_url?: string;
}

const FALLBACK_LECTURES: Lecture[] = [
  {
    id: 1,
    title: "테스트 전자책",
    description: "백엔드 연결 실패 시에도 열람 가능한 테스트 전자책입니다.",
    category: "PDF",
  },
];

interface EbookLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EbookLibraryModal({ isOpen, onClose }: EbookLibraryModalProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
      return;
    }

    const resolveApiBase = async () => {
      if (typeof window === 'undefined') return;

      const host = window.location.hostname || 'localhost';
      const protocol = window.location.protocol || 'http:';

      if (host !== 'localhost' && host !== '127.0.0.1') {
        setApiBase(`${protocol}//${host}:8000`);
        return;
      }

      for (const port of [8000, 8001, 8002]) {
        const candidate = `${protocol}//${host}:${port}`;
        try {
          const res = await fetch(`${candidate}/api/health/db`);
          if (res.ok) {
            setApiBase(candidate);
            return;
          }
        } catch {
          // try next port
        }
      }
    };

    void resolveApiBase();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLectures();
    }
  }, [isOpen, apiBase]);

  const fetchLectures = async () => {
    setLoading(true);
    setErrorNotice(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${apiBase}/api/lectures`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => b.id - a.id);
          setLectures(sorted);
        } else {
          setLectures(FALLBACK_LECTURES);
        }
      } else {
        setLectures(FALLBACK_LECTURES);
        setErrorNotice('서버 연결이 불안정하여 테스트 전자책 목록을 표시합니다.');
      }
    } catch (error) {
      console.warn('Failed to fetch lectures, using fallback list');
      setLectures(FALLBACK_LECTURES);
      setErrorNotice('강의 목록을 불러오지 못해 테스트 전자책으로 대체되었습니다.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleDetail = (lectureId: number) => {
    window.open(`/ebook/${lectureId}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-4xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-blue-50/50 to-white dark:from-slate-800/50 dark:to-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black dark:text-white">전자책 라이브러리</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">원하는 전자책을 선택하고 상세 내용을 확인하세요.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/50">
              {errorNotice && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                  {errorNotice}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : lectures.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <BookOpen className="mx-auto mb-4 opacity-50" size={48} />
                  <p className="text-lg font-medium">현재 등록된 전자책이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lectures.map(lecture => (
                    
                    <div 
                      key={lecture.id} 
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden"
                    >
                      {/* 표지 이미지 추가 */}
                      <div className="relative mb-6 h-48 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={lecture.cover_image_url ? `${apiBase}/${lecture.cover_image_url.replace(/^\//, '')}` : `https://picsum.photos/seed/vibe_edu_book_${lecture.id}/400/300`} 
                          alt={lecture.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      </div>
                      
                      <div className="flex-1 mb-6">
                        <div className="flex gap-2 mb-4">
                          <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                            {lecture.category}
                          </span>
                          <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                            HTML
                          </span>
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {lecture.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                          {lecture.description || "상세 설명이 없습니다."}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button 
                          onClick={() => handleDetail(lecture.id)}
                          className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <BookOpen size={18} /> 상세보기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

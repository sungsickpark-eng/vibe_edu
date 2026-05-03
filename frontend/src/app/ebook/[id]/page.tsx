"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, ShoppingCart, PlayCircle, Star, CheckCircle2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { loadTossPayments } from "@tosspayments/payment-sdk";

interface Lecture {
  id: number;
  title: string;
  description: string;
  category: string;
  file_url: string;
}

interface AccessResponse {
  lecture_id: number;
  is_admin: boolean;
  is_purchased: boolean;
  can_view: boolean;
}

export default function EbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lectureId = resolvedParams.id;
  const router = useRouter();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  // 간소화를 위해 실제 앱에서는 백엔드에 구매 여부를 조회하는 API가 필요합니다.
  const [isPurchased, setIsPurchased] = useState(false); 
  const [isReadOptionOpen, setIsReadOptionOpen] = useState(false);
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
      return;
    }

    if (typeof window === "undefined") return;

    const host = window.location.hostname || "localhost";
    const protocol = window.location.protocol || "http:";

    if (host !== "localhost" && host !== "127.0.0.1") {
      setApiBase(`${protocol}//${host}:8000`);
      return;
    }

    const resolveApiBase = async () => {
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
    fetchLecture();
    fetchAccess();
  }, [apiBase, lectureId]);

  const fetchLecture = async () => {
    try {
      const res = await fetch(`${apiBase}/api/lectures/${lectureId}`);
      if (res.ok) {
        const data = await res.json();
        setLecture(data);
      } else {
        alert("해당 전자책을 찾을 수 없습니다.");
        router.push("/ebook");
      }
    } catch (error) {
      console.error("Fetch lecture error", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccess = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsPurchased(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/v1/lectures/${lectureId}/access`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: AccessResponse = await res.json();
        setIsPurchased(Boolean(data.can_view));
      } else {
        setIsPurchased(false);
      }
    } catch {
      setIsPurchased(false);
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!lecture) return;

    const amount = isTestEbook ? 9900 : 5000;

    try {
      const tossPayments = await loadTossPayments("test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq");
      const orderId = "order_" + Math.random().toString(36).substring(2, 10);
      
      await tossPayments.requestPayment("카드", {
        amount,
        orderId: `lecture_${lectureId}_${orderId}`,
        orderName: lecture.title,
        customerName: "바이브에듀 회원",
        successUrl: `${window.location.origin}/success?lectureId=${lectureId}`,
        failUrl: window.location.origin + "/fail",
      });
    } catch (error: any) {
      if (error.code === "USER_CANCEL" || error.message === "취소되었습니다.") {
        console.log("사용자가 결제를 취소했습니다.");
        return;
      }
      console.error("Payment error", error);
      alert("결제 진행 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"));
    }
  };

  const handleOpenReadOptions = () => {
    setIsReadOptionOpen(true);
  };

  const handleOpenHtmlViewer = () => {
    window.open(`/ebook/html/${lectureId}`, "_blank", "noopener,noreferrer");
    setIsReadOptionOpen(false);
  };

  const handleOpenPdfViewer = () => {
    window.open(`/viewer/${lectureId}`, "_blank", "noopener,noreferrer");
    setIsReadOptionOpen(false);
  };

  const handleBackToLibrary = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/ebook");
  };

  const isTestEbook = Boolean(lecture?.title?.includes("테스트"));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!lecture) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-white">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 mt-16">
        <button 
          onClick={handleBackToLibrary} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-10 font-bold"
        >
          <ArrowLeft size={20} /> 라이브러리로 돌아가기
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="w-full aspect-3/4 bg-linear-to-br from-blue-600 to-purple-700 rounded-4xl shadow-2xl flex flex-col items-center justify-center p-12 overflow-hidden border border-slate-200 dark:border-slate-800">
              <BookOpen size={100} className="text-white/20 mb-8 absolute top-12 left-12" />
              <div className="relative z-10 text-center">
                <div className="flex justify-center gap-2 mb-6">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold inline-block">
                    {lecture.category}
                  </span>
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold inline-block">
                    HTML
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight break-keep">
                  {lecture.title}
                </h1>
                <p className="text-white/80 font-medium">VIBE_EDU PUBLISHING</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
                <Star size={20} className="fill-current" />
              </div>
              <span className="text-slate-500 font-medium">5.0 (99+ 리뷰)</span>
            </div>

            <h2 className="text-3xl font-black mb-6">{lecture.title}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed break-keep">
              {lecture.description}
            </p>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 mb-10">
              <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 font-bold">판매가</span>
                <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{isTestEbook ? "₩9,900" : "₩5,000"}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {['평생 소장 가능', 'PC / 모바일 완벽 지원', '저자 직통 Q&A 제공'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                    <CheckCircle2 size={18} className="text-green-500" /> {item}
                  </li>
                ))}
              </ul>

              {isPurchased ? (
                <button 
                  onClick={handleOpenReadOptions}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
                >
                  <PlayCircle size={22} /> 열람하기
                </button>
              ) : (
                <button 
                  onClick={handlePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-lg"
                >
                  <ShoppingCart size={22} /> {isTestEbook ? "9,900원 결제하기" : "5,000원 결제하기"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {isReadOptionOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">열람 형식 선택</h3>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">원하는 형식으로 전자책을 열어보세요.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReadOptionOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOpenHtmlViewer}
                className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-left transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/30 dark:hover:bg-blue-900/30"
              >
                <div className="text-base font-black text-blue-700 dark:text-blue-300">HTML 버전 보기</div>
                <div className="mt-1 text-xs font-medium text-blue-600/80 dark:text-blue-300/80">탭 기반 브라우저 리더로 열람</div>
              </button>

              <button
                type="button"
                onClick={handleOpenPdfViewer}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="text-base font-black text-slate-800 dark:text-slate-100">PDF 버전 보기</div>
                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">원본 PDF 뷰어로 열람</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

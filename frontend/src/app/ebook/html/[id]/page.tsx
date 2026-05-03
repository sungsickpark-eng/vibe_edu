"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

type Lecture = {
  id: number;
  title: string;
  html_file_url?: string | null;
  category: string;
};

export default function HtmlEbookViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lectureId = resolvedParams.id;
  const router = useRouter();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
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
    const fetchLecture = async () => {
      try {
        const res = await fetch(`${apiBase}/api/lectures/${lectureId}`);
        if (!res.ok) {
          alert("강의 정보를 불러올 수 없습니다.");
          router.push("/ebook");
          return;
        }

        const data = await res.json();
        setLecture(data);
      } catch {
        alert("강의 정보를 불러오는 중 오류가 발생했습니다.");
        router.push("/ebook");
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [apiBase, lectureId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-36 lg:pt-40">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </main>
      </div>
    );
  }

  if (!lecture) return null;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(`/ebook/${lectureId}`);
  };

  const htmlUrl = lecture.html_file_url
    ? `${apiBase}/${lecture.html_file_url.replace(/^\//, "")}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-36 sm:px-6 lg:px-8 lg:pt-40">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> 이전으로
        </button>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">{lecture.title} - HTML 열람</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {lecture.category === "MD" ? "MD 파일에서 자동 생성된 HTML입니다." : "HTML 콘텐츠를 표시합니다."}
          </p>
        </div>

        {htmlUrl ? (
          <iframe
            src={htmlUrl}
            title={`${lecture.title} HTML Viewer`}
            className="h-[80vh] w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800"
          />
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
            이 전자책에는 생성된 HTML 버전이 없습니다. 관리자에게 MD 업로드 또는 HTML 생성 여부를 확인하세요.
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Navbar from "@/components/Navbar";

type MdPayload = {
  lecture_id: number;
  title: string;
  markdown_content: string;
  html_file_url?: string | null;
};

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function MdEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lectureId = resolvedParams.id;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [htmlFileUrl, setHtmlFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
    } else {
      const host = window.location.hostname || "localhost";
      const protocol = window.location.protocol || "http:";
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        setApiBase(`${protocol}//${host}:8000`);
      } else {
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
      }
    }

    const safeStorage = window.localStorage;
    const nextToken = safeStorage && typeof safeStorage.getItem === "function"
      ? safeStorage.getItem("token")
      : null;
    setToken(nextToken);

    const payload = nextToken ? parseJwtPayload(nextToken) : null;
    const admin = Boolean(payload?.is_admin);
    if (!admin) {
      alert("관리자만 접근할 수 있습니다.");
      router.replace("/login");
      return;
    }
    setIsAdmin(true);
  }, [router]);

  useEffect(() => {
    if (!isAdmin || !token) return;

    const fetchMarkdown = async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/admin/lectures/${lectureId}/markdown`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          alert("MD 내용을 불러오지 못했습니다.");
          router.push("/admin/manage");
          return;
        }

        const data: MdPayload = await res.json();
        setTitle(data.title);
        setMarkdown(data.markdown_content);
        setHtmlFileUrl(data.html_file_url ?? null);
      } catch {
        alert("MD 내용을 불러오는 중 오류가 발생했습니다.");
        router.push("/admin/manage");
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [apiBase, isAdmin, lectureId, router, token]);

  const handleSave = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/lectures/${lectureId}/markdown`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markdown_content: markdown }),
      });

      if (!res.ok) {
        const errText = await res.text();
        alert(`저장 실패: ${errText}`);
        return;
      }

      const data = await res.json();
      setHtmlFileUrl(data.html_file_url ?? null);
      alert("저장 완료! HTML이 재생성되었습니다.");
    } catch {
      alert("저장 중 네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-20">
          <p className="font-bold text-slate-500 dark:text-slate-400">에디터를 준비하는 중...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/admin/manage")}
          className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> 전자책 관리로
        </button>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">MD 편집 도구</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {htmlFileUrl && (
            <button
              type="button"
              onClick={() => window.open(`${apiBase}/${htmlFileUrl.replace(/^\//, "")}`, "_blank", "noopener,noreferrer")}
              className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700"
            >
              생성된 HTML 미리보기
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="h-[60vh] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            <Save size={16} /> {saving ? "저장 중..." : "MD 저장 + HTML 재생성"}
          </button>
        </div>
      </main>
    </div>
  );
}

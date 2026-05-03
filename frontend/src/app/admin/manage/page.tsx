"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";

type Lecture = {
  id: number;
  title: string;
  description: string;
  category: string;
  file_url: string;
  md_file_url?: string | null;
  html_file_url?: string | null;
};

type EditState = {
  id: number;
  title: string;
  description: string;
  category: string;
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

export default function AdminManagePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
    if (!payload?.is_admin) {
      alert("관리자만 접근할 수 있습니다.");
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  const fetchLectures = async () => {
    setLoading(true);
    setLoadError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${apiBase}/api/lectures`, { signal: controller.signal });
      if (!res.ok) {
        setLoadError("전자책 목록 응답이 비정상입니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      const data = await res.json();
      const sorted = Array.isArray(data) ? [...data].sort((a, b) => b.id - a.id) : [];
      setLectures(sorted);
    } catch {
      setLoadError("전자책 목록 요청이 지연되거나 실패했습니다. 백엔드 상태를 확인해 주세요.");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      fetchLectures();
    }
  }, [checkingAuth, apiBase]);

  const openEdit = (lecture: Lecture) => {
    setEditState({
      id: lecture.id,
      title: lecture.title,
      description: lecture.description ?? "",
      category: lecture.category,
    });
  };

  const closeEdit = () => {
    setEditState(null);
  };

  const handleSaveEdit = async () => {
    if (!editState || !token) return;

    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/lectures/${editState.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editState.title,
          description: editState.description,
          category: editState.category,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`수정 실패: ${text}`);
        return;
      }

      await fetchLectures();
      closeEdit();
      alert("전자책이 수정되었습니다.");
    } catch {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lectureId: number) => {
    if (!token) return;
    if (!confirm("정말 이 전자책을 삭제하시겠습니까?")) return;

    setDeletingId(lectureId);
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/lectures/${lectureId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`삭제 실패: ${text}`);
        return;
      }

      setLectures((prev) => prev.filter((lecture) => lecture.id !== lectureId));
      alert("전자책이 삭제되었습니다.");
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-20">
          <p className="font-bold text-slate-500 dark:text-slate-400">관리자 권한 확인 중...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-36 sm:px-6 lg:px-8 lg:pt-40">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">전자책 관리</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">등록, 수정, 삭제를 한 화면에서 관리합니다.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/upload")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <Plus size={16} /> 전자책 등록
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="p-8 text-center font-bold text-slate-500 dark:text-slate-400">목록을 불러오는 중...</div>
          ) : loadError ? (
            <div className="p-8 text-center">
              <p className="mb-4 text-sm font-bold text-rose-600 dark:text-rose-400">{loadError}</p>
              <button
                type="button"
                onClick={fetchLectures}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                다시 불러오기
              </button>
            </div>
          ) : lectures.length === 0 ? (
            <div className="p-8 text-center font-bold text-slate-500 dark:text-slate-400">등록된 전자책이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-black text-slate-600 dark:text-slate-300">ID</th>
                    <th className="px-4 py-3 text-left font-black text-slate-600 dark:text-slate-300">제목</th>
                    <th className="px-4 py-3 text-left font-black text-slate-600 dark:text-slate-300">카테고리</th>
                    <th className="px-4 py-3 text-left font-black text-slate-600 dark:text-slate-300">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map((lecture) => (
                    <tr key={lecture.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{lecture.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{lecture.title}</p>
                        <p className="line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">{lecture.description || "설명 없음"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{lecture.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(lecture)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Pencil size={14} /> 수정
                          </button>

                          {lecture.category === "MD" && (
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/md-editor/${lecture.id}`)}
                              className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                            >
                              MD 편집
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(lecture.id)}
                            disabled={deletingId === lecture.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-900/30"
                          >
                            <Trash2 size={14} /> {deletingId === lecture.id ? "삭제 중..." : "삭제"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editState && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">전자책 수정</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={editState.title}
                onChange={(e) => setEditState((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="제목"
              />

              <textarea
                value={editState.description}
                onChange={(e) => setEditState((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                className="h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="상세 설명"
              />

              <select
                value={editState.category}
                onChange={(e) => setEditState((prev) => (prev ? { ...prev, category: e.target.value } : null))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="PDF">PDF</option>
                <option value="MD">MD</option>
                <option value="VOD">VOD</option>
                <option value="EPUB">EPUB</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={14} /> {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

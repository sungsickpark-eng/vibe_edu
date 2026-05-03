"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function VibeViewer({ params }: { params: Promise<{ id: string }> }) {
  // 1. params Promise를 해제합니다.
  const resolvedParams = use(params);
  const lectureId = resolvedParams.id;
  const router = useRouter();
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');
  const [token, setToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const streamUrl = token
    ? `${apiBase}/api/v1/contents/${lectureId}/stream?token=${encodeURIComponent(token)}`
    : null;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
    } else {
      if (typeof window === 'undefined') return;

      const host = window.location.hostname || 'localhost';
      const protocol = window.location.protocol || 'http:';

      if (host !== 'localhost' && host !== '127.0.0.1') {
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
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(window.localStorage.getItem('token'));
      setTokenReady(true);
    }

    // 보안: 우클릭 및 캡처 단축키 차단
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'u')) {
        e.preventDefault();
        alert("보안 정책상 인쇄 및 복사가 제한됩니다.");
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    router.push(`/ebook/${lectureId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden text-white">
      {/* 뷰어 헤더 */}
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-20">
        <h2 className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-lg font-bold text-transparent">
          vibe_edu Secure Viewer
        </h2>
        <button 
          onClick={handleClose} 
          className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-colors"
        >
          닫기
        </button>
      </div>

      <div className="relative flex-1 bg-[#111]">
        {/* 워터마크 레이어 */}
        <div className="absolute inset-0 z-10 pointer-events-none grid grid-cols-3 gap-10 p-10 opacity-[0.03] select-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="text-white text-xl transform -rotate-45 font-bold">
              vibe_edu_PROTECTED
            </div>
          ))}
        </div>

        {/* PDF 스트리밍 객체 */}
        {!tokenReady ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <p>인증 정보를 확인하는 중입니다...</p>
          </div>
        ) : !streamUrl ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <p>로그인이 필요합니다.</p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              로그인하러 가기
            </button>
          </div>
        ) : (
          <object
            data={streamUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>PDF를 불러올 수 없습니다.</p>
              <p className="text-sm">권한이 없거나 파일이 존재하지 않을 수 있습니다.</p>
            </div>
          </object>
        )}
      </div>
    </div>
  );
}
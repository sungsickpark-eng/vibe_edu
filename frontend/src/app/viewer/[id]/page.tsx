"use client";
import { useEffect, useState, use } from 'react'; // use 추가

const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const streamUrl = `http://localhost:8000/api/v1/contents/${lectureId}/stream?token=${token}`;

export default function VibeViewer({ params }: { params: Promise<{ id: string }> }) {
  // 1. params Promise를 해제합니다.
  const resolvedParams = use(params);
  const lectureId = resolvedParams.id;
  
  const streamUrl = `http://localhost:8000/api/v1/contents/${lectureId}/stream`;

  useEffect(() => {
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

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden text-white">
      {/* 뷰어 헤더 */}
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-20">
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          vibe_edu Secure Viewer
        </h2>
        <button 
          onClick={() => window.history.back()} 
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
      </div>
    </div>
  );
}
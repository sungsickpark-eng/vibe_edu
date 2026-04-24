"use client";
import { useEffect } from 'react';

export default function ViewerPage({ params }: { params: { id: string } }) {
  useEffect(() => {
    const preventActions = (e: any) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'p' || e.key === 's')) e.preventDefault();
      if (e.type === 'contextmenu') e.preventDefault();
    };
    document.addEventListener('keydown', preventActions);
    document.addEventListener('contextmenu', preventActions);
    return () => {
      document.removeEventListener('keydown', preventActions);
      document.removeEventListener('contextmenu', preventActions);
    };
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">vibe_edu 보안 뷰어 (ID: {params.id})</h1>
      <div className="relative border-4 border-dashed border-gray-700 h-[600px] flex items-center justify-center">
        <p className="text-gray-500 text-lg italic">PDF 콘텐츠가 여기에 렌더링됩니다.</p>
        <div className="absolute inset-0 flex flex-wrap opacity-5 pointer-events-none select-none">
           {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="m-10 text-4xl transform -rotate-45">vibe_edu_USER_ID</div>
           ))}
        </div>
      </div>
    </div>
  );
}

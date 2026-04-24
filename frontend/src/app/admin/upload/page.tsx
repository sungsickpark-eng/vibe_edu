"use client";
import { useState } from 'react';

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('category', 'PDF');

    const res = await fetch('http://localhost:8000/api/v1/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('강의가 등록되었습니다!');
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl shadow-sm bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">새 강의 등록 (vibe_edu)</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">강의 제목</label>
          <input 
            type="text" className="w-full border p-2 rounded" 
            onChange={(e) => setTitle(e.target.value)} required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">상세 설명</label>
          <textarea 
            className="w-full border p-2 rounded" 
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PDF 파일 선택</label>
          <input 
            type="file" accept=".pdf" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} required 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
          업로드 시작
        </button>
      </form>
    </div>
  );
}
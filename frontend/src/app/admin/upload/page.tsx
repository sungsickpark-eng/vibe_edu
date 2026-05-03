"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Type, AlignLeft, Tag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<File[]>([]);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrls, setThumbnailPreviewUrls] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('PDF');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
    } else if (typeof window !== 'undefined') {
      const host = window.location.hostname || 'localhost';
      const protocol = window.location.protocol || 'http:';
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
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

    const token = localStorage.getItem('token');
    const payload = token ? parseJwtPayload(token) : null;
    const admin = Boolean(payload?.is_admin);

    if (!admin) {
      alert('관리자만 접근할 수 있습니다.');
      router.replace('/login');
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage]);

  useEffect(() => {
    if (thumbnails.length === 0) {
      setThumbnailPreviewUrls([]);
      return;
    }

    const objectUrls = thumbnails.map((thumb) => URL.createObjectURL(thumb));
    setThumbnailPreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnails]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("전자책 파일을 선택해주세요.");
      return;
    }

    if (category === 'MD' && !file.name.toLowerCase().endsWith('.md')) {
      alert('MD 카테고리는 .md 파일만 업로드할 수 있습니다.');
      return;
    }

    if (!coverImage) {
      alert("표지 이미지를 선택해주세요.");
      return;
    }

    if (thumbnails.length > 10) {
      alert("썸네일은 최대 10개까지 등록할 수 있습니다.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', desc);
      formData.append('category', category);
      formData.append('cover_image', coverImage);
      thumbnails.forEach((thumb) => {
        formData.append('thumbnail_images', thumb);
      });

      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${apiBase}/api/v1/admin/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setUploadSuccess(true);
        // Reset form
        setFile(null);
        setCoverImage(null);
        setThumbnails([]);
        setTitle('');
        setDesc('');
        
        setTimeout(() => {
          setUploadSuccess(false);
          if (category === 'MD' && result?.id) {
            router.push(`/admin/md-editor/${result.id}`);
            return;
          }
          router.push('/admin/manage');
        }, 2000);
      } else {
        alert('업로드 실패: 서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Upload error', error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`업로드 중 통신 오류가 발생했습니다. (${message})`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-20">
          <p className="text-slate-500 dark:text-slate-400 font-bold">관리자 권한 확인 중...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col selection:bg-blue-100 dark:selection:bg-blue-900">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 mt-16">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-4xl border border-slate-100 bg-white p-10 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          
          {uploadSuccess && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <CheckCircle2 size={80} className="text-green-500 mb-6" />
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">업로드 성공!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">라이브러리로 이동합니다...</p>
            </div>
          )}

          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 font-bold">
            <ArrowLeft size={18} /> 메인으로 돌아가기
          </Link>

          <button
            type="button"
            onClick={() => router.push('/admin/manage')}
            className="mb-4 ml-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            전자책 관리로 이동
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl">
              <Upload className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">새 전자책 등록</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">라이브러리에 새로운 지식을 추가하세요.</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">업로드 형식</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategory('PDF');
                    setFile(null);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${category === 'PDF' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                >
                  PDF 전자책 업로드
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategory('MD');
                    setFile(null);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${category === 'MD' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                >
                  MD 전자책 업로드
                </button>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                MD를 선택하면 .md 파일 업로드 후 자동으로 HTML 버전이 생성됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type size={16} /> 책 제목
              </label>
              <input 
                type="text" 
                placeholder="예: VIBE CODING 마스터 클래스" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlignLeft size={16} /> 상세 설명
              </label>
              <textarea 
                placeholder="책의 핵심 내용과 독자가 얻을 수 있는 가치를 적어주세요." 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-30 resize-y"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Tag size={16} /> 카테고리
                </label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setFile(null);
                  }}
                >
                  <option value="PDF">PDF 전자책</option>
                  <option value="MD">Markdown(MD) 전자책</option>
                  <option value="VOD">VOD 강의</option>
                  <option value="EPUB">EPUB 전자책</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText size={16} /> {category === 'MD' ? 'MD 파일 업로드 (.md)' : '전자책 파일 업로드 (.pdf)'}
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept={category === 'MD' ? '.md,text/markdown' : '.pdf'}
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    required 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed p-4 rounded-xl flex items-center justify-center gap-3 transition-colors ${file ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                    {file ? (
                      <>
                        <FileText size={20} />
                        <span className="font-bold truncate max-w-50">{file.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="font-medium">클릭하여 파일 선택</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Upload size={16} /> 책 표지 (필수, 1장)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed p-4 rounded-xl flex items-center justify-center gap-3 transition-colors ${coverImage ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                    {coverImage ? (
                      <>
                        <FileText size={20} />
                        <span className="font-bold truncate max-w-50">{coverImage.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="font-medium">표지 이미지 선택</span>
                      </>
                    )}
                  </div>
                </div>
                {coverPreviewUrl && (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                    <img
                      src={coverPreviewUrl}
                      alt="표지 미리보기"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Upload size={16} /> 책 썸네일 (최대 10장)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 10) {
                        alert('썸네일은 최대 10개까지 선택할 수 있습니다.');
                        setThumbnails(files.slice(0, 10));
                        return;
                      }
                      setThumbnails(files);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed p-4 rounded-xl flex items-center justify-center gap-3 transition-colors ${thumbnails.length > 0 ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                    {thumbnails.length > 0 ? (
                      <>
                        <FileText size={20} />
                        <span className="font-bold">{thumbnails.length}개 선택됨</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="font-medium">썸네일 이미지 선택</span>
                      </>
                    )}
                  </div>
                </div>
                {thumbnailPreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {thumbnailPreviewUrls.map((thumbUrl, index) => (
                      <div key={`${thumbUrl}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                        <img
                          src={thumbUrl}
                          alt={`썸네일 미리보기 ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUploading || !file || !coverImage}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-8 shadow-xl shadow-blue-600/20"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload size={20} /> 라이브러리에 등록하기
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
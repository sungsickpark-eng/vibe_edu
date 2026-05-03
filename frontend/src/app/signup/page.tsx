"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
      return;
    }

    if (typeof window === 'undefined') return;

    const host = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';

    if (host !== 'localhost' && host !== '127.0.0.1') {
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const res = await fetch(`${apiBase}/api/v1/signup`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('회원가입이 완료되었습니다! 로그인해 주세요.');
        router.push('/login');
      } else {
        const errorData = await res.json();
        alert(`회원가입 실패: ${errorData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Signup error', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-6 selection:bg-blue-100 dark:selection:bg-blue-900">
      <Link href="/login" className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> <span className="font-bold">로그인으로 돌아가기</span>
      </Link>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">계정 만들기</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">바이브에듀와 함께 AI 코딩의 세계로 빠져보세요.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={20} className="text-slate-400" />
            </div>
            <input 
              type="email" 
              placeholder="이메일 주소" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 pl-12 pr-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-slate-400" />
            </div>
            <input 
              type="password" 
              placeholder="비밀번호" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 pl-12 pr-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required
              minLength={6}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-slate-400" />
            </div>
            <input 
              type="password" 
              placeholder="비밀번호 확인" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 pl-12 pr-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} 
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              '회원가입 완료'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
          이미 계정이 있으신가요? <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">로그인</Link>
        </div>
      </div>
    </div>
  );
}

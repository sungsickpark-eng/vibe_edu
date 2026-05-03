"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await fetch(`${apiBase}/api/v1/login`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        alert('로그인되었습니다!');
        router.push('/');
      } else {
        let message = '이메일 또는 비밀번호가 틀렸습니다.';
        try {
          const errorData = await res.json();
          if (errorData?.detail) message = String(errorData.detail);
        } catch {
          // ignore json parse error
        }
        alert(message);
      }
    } catch (error) {
      console.error('Login error', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: 백엔드 소셜 로그인 엔드포인트로 리디렉션하거나 팝업을 띄우는 로직
    // 예: window.location.href = `http://localhost:8000/api/v1/auth/${provider}`;
    alert(`${provider} 로그인 연동 준비 중입니다. 필요한 키 값을 설정해주세요.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-6 selection:bg-blue-100 dark:selection:bg-blue-900">
      <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> <span className="font-bold">메인으로</span>
      </Link>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">vibe_edu 시작하기</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">단 3초만에 가입하고 모든 기능을 누려보세요.</p>
        </div>

        {/* 소셜 로그인 버튼 영역 */}
        <div className="space-y-3 mb-8">
          <button 
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-[#391B1B] bg-[#FEE500] hover:bg-[#F4DC00] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 3c-5.52 0-10 3.51-10 7.84 0 2.8 1.93 5.25 4.88 6.64l-1.25 4.64c-.1.35.25.64.55.45l5.37-3.56c.46.06.94.1 1.45.1 5.52 0 10-3.51 10-7.84S17.52 3 12 3z"/>
            </svg>
            카카오로 계속하기
          </button>
          
          <button 
            onClick={() => handleSocialLogin('naver')}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-white bg-[#03C75A] hover:bg-[#02b351] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
            </svg>
            네이버로 계속하기
          </button>

          <button 
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        <div className="relative flex items-center py-5 mb-4">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">또는 이메일로 로그인</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* 기존 이메일 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="이메일 주소" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="비밀번호" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <Mail size={18} /> 로그인
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
          계정이 없으신가요? <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
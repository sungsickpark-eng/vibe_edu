"use client";
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const res = await fetch('http://localhost:8000/api/v1/login', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      alert('로그인되었습니다!');
      window.location.href = '/';
    } else {
      alert('로그인 실패');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">vibe_edu 로그인</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" placeholder="이메일" className="w-full border p-3 rounded" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="비밀번호" className="w-full border p-3 rounded" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-black text-white py-3 rounded-lg font-bold">로그인</button>
      </form>
    </div>
  );
}
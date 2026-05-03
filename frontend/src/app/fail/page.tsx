"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function FailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-12 max-w-lg w-full text-center border border-slate-100 dark:border-slate-800">
          <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">결제 실패</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
            결제 처리 중 문제가 발생했습니다.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8 text-left text-sm font-medium space-y-2">
            <p><span className="text-slate-400">오류 코드:</span> {code}</p>
            <p><span className="text-slate-400">오류 메시지:</span> {message}</p>
          </div>
          <button
            onClick={() => router.push("/ebook")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    </div>
  );
}

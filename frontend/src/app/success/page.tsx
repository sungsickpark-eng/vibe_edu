"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const lectureId = searchParams.get("lectureId");
  const [purchaseMessage, setPurchaseMessage] = useState("구매 내역을 저장하는 중입니다...");

  useEffect(() => {
    const registerPurchase = async () => {
      if (!paymentKey || !orderId || !amount) {
        setPurchaseMessage("결제 정보가 누락되어 구매내역 저장을 건너뜁니다.");
        return;
      }

      if (!lectureId) {
        setPurchaseMessage("강의 ID가 없어 구매내역 저장을 건너뜁니다.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setPurchaseMessage("로그인 토큰이 없어 구매내역 저장을 건너뜁니다.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/v1/purchase/${lectureId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorBody = await res.text();
          setPurchaseMessage(`구매내역 저장 실패: ${errorBody}`);
          return;
        }

        const data = await res.json();
        setPurchaseMessage(data.message || "구매내역이 저장되었습니다.");
      } catch {
        setPurchaseMessage("구매내역 저장 중 네트워크 오류가 발생했습니다.");
      }
    };

    registerPurchase();
  }, [paymentKey, orderId, amount, lectureId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-2xl p-12 max-w-lg w-full text-center border border-slate-100 dark:border-slate-800">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">결제 완료!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
            성공적으로 결제가 처리되었습니다.
          </p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-6">
            {purchaseMessage}
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8 text-left text-sm font-medium space-y-2">
            <p><span className="text-slate-400">주문번호:</span> {orderId}</p>
            <p><span className="text-slate-400">결제금액:</span> {amount}원</p>
          </div>
          <button
            onClick={() => router.push("/ebook")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            전자책 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

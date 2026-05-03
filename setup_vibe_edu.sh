#!/bin/bash

# 1. 루트 폴더 생성
PROJECT_NAME="vibe_edu"
mkdir $PROJECT_NAME
cd $PROJECT_NAME

echo "🚀 [$PROJECT_NAME] 프로젝트 구성을 시작합니다..."

# 2. Backend (FastAPI) 설정
echo "📂 백엔드 설정 중..."
mkdir backend
cd backend
conda activate vibe_edu
pip install fastapi uvicorn python-multipart

# 기본 main.py 생성
cat << 'EOP' > main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to vibe_edu API"}
EOP

pip freeze > requirements.txt
deactivate
cd ..

# 3. Frontend (Next.js) 설정
echo "📂 프론트엔드 설정 중 (잠시만 기다려주세요)..."
# 비대화형 모드로 Next.js 설치 (기본 설정 사용)
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

cd frontend
# 뷰어용 예시 페이지 생성
mkdir -p src/app/viewer/\[id\]
cat << 'EOP' > src/app/viewer/\[id\]/page.tsx
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
EOP
cd ..

echo "✅ 모든 설정이 완료되었습니다!"
echo "------------------------------------------"
echo "1. 백엔드 실행: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "2. 프론트엔드 실행: cd frontend && npm run dev"
echo "------------------------------------------"

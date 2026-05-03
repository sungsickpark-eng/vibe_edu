#!/bin/bash

# --- 설정 및 변수 ---
BACKEND_START_PORT=8000
FRONTEND_START_PORT=3000

# 포트 확인 함수
find_available_port() {
    local port=$1
    while lsof -i :$port > /dev/null; do
        echo "⚠️  포트 $port 이(가) 사용 중입니다. 다음 포트를 시도합니다..." >&2
        port=$((port + 1))
    done
    echo $port
}

echo "🔍 사용 가능한 포트를 확인하는 중..."

# 1. 백엔드 포트 결정
BE_PORT=$(find_available_port $BACKEND_START_PORT)
# 2. 프론트엔드 포트 결정
FE_PORT=$(find_available_port $FRONTEND_START_PORT)

echo "------------------------------------------"
echo "🌐 백엔드: http://localhost:$BE_PORT"
echo "💻 프론트: http://localhost:$FE_PORT"
echo "------------------------------------------"

# --- 3. 백엔드 실행 ---
echo "📂 백엔드(FastAPI) 실행 중..."
cd backend
# 콘다 환경 활성화 시도 (스크립트의 conda activate는 source를 통해야 함)
eval "$(conda shell.bash hook)"
conda activate vibe_edu
uvicorn main:app --host 0.0.0.0 --port $BE_PORT --reload & 
BE_PID=$!
cd ..

# --- 4. 프론트엔드 실행 ---
echo "📂 프론트엔드(Next.js) 실행 중..."
cd frontend
# 프론트엔드가 실제 백엔드 포트를 사용하도록 환경 변수 동기화
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    grep -v '^NEXT_PUBLIC_API_BASE_URL=' "$ENV_FILE" > "$ENV_FILE.tmp" || true
    mv "$ENV_FILE.tmp" "$ENV_FILE"
fi
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:$BE_PORT" >> "$ENV_FILE"
# Next.js는 PORT 환경변수를 통해 포트 변경 가능
PORT=$FE_PORT npm run dev &
FE_PID=$!
cd ..

# --- 5. 종료 관리 ---
function cleanup {
    echo -e "\n🛑 서비스를 종료합니다 (PIDs: $BE_PID, $FE_PID)..."
    kill $BE_PID $FE_PID
    exit
}

trap cleanup SIGINT SIGTERM

echo "✅ 모든 서비스가 실행되었습니다. 종료하려면 Ctrl+C를 누르세요."
wait
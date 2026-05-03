/* ===== Reset & Base ===== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #0a0a0f;
  --surface: #14141f;
  --surface2: #1c1c2e;
  --border: #2a2a40;
  --text: #e8e8f0;
  --text-dim: #8888a0;
  --accent: #7c5cfc;
  --accent2: #c084fc;
  --accent3: #38bdf8;
  --gradient: linear-gradient(135deg, #7c5cfc, #c084fc, #38bdf8);
  --radius: 16px;
  --radius-sm: 12px;
}

html { font-size: 16px; }

body {
  font-family: 'Noto Sans KR', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
}

.bg-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(600px circle at 30% 20%, rgba(124,92,252,.12), transparent 60%),
    radial-gradient(500px circle at 70% 80%, rgba(56,189,248,.08), transparent 60%);
}

/* ===== Screens ===== */
.screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: opacity .5s ease, visibility .5s ease;
  z-index: 1;
}
.screen.active { opacity: 1; visibility: visible; }

/* ===== Intro ===== */
.intro-card {
  text-align: center;
  max-width: 480px;
  animation: fadeUp .8s ease;
}

.intro-emoji {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.intro-card h1 {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16px;
}

.gradient-text {
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.intro-desc {
  color: var(--text-dim);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 36px;
}

.btn-start {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient);
  color: #fff;
  border: none;
  padding: 16px 40px;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  font-family: inherit;
}
.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(124,92,252,.35);
}

.intro-time {
  margin-top: 16px;
  color: var(--text-dim);
  font-size: .85rem;
}

/* ===== Progress Bar ===== */
.progress-bar {
  position: relative;
  width: 100%;
  height: 8px;
  background: var(--surface2);
  border-radius: 999px;
  margin-bottom: 40px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient);
  border-radius: 999px;
  width: 16.66%;
  transition: width .5s cubic-bezier(.4,0,.2,1);
}

.progress-text {
  position: absolute;
  right: 0;
  top: -28px;
  font-size: .82rem;
  color: var(--text-dim);
  font-weight: 500;
}

/* ===== Quiz ===== */
.quiz-container {
  width: 100%;
  max-width: 600px;
}

.question-area {
  animation: fadeUp .5s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.question-number {
  display: inline-block;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: .9rem;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 28px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  color: var(--text);
  padding: 18px 22px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s ease;
  text-align: left;
  font-family: inherit;
  line-height: 1.5;
}
.option-btn:hover {
  border-color: var(--accent);
  background: rgba(124,92,252,.08);
  transform: translateX(4px);
}
.option-btn:active {
  transform: scale(.98);
}

.option-btn .opt-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.option-btn .opt-label {
  flex: 1;
}

/* ===== Result ===== */
.result-container {
  width: 100%;
  max-width: 560px;
  animation: fadeUp .8s ease;
}

.result-badge {
  text-align: center;
  margin-bottom: 8px;
  font-size: .85rem;
  color: var(--text-dim);
  font-weight: 500;
  letter-spacing: 1px;
}

.result-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 36px 32px;
  text-align: center;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.result-name {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 6px;
}
.result-name .gradient-text { font-size: inherit; }

.result-tagline {
  color: var(--text-dim);
  font-size: .95rem;
  margin-bottom: 24px;
}

.result-desc {
  color: var(--text);
  font-size: .95rem;
  line-height: 1.8;
  text-align: left;
  margin-bottom: 28px;
  background: var(--surface2);
  padding: 20px;
  border-radius: var(--radius-sm);
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 28px;
}

.tag {
  background: rgba(124,92,252,.12);
  color: var(--accent2);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: .82rem;
  font-weight: 600;
}

.result-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent3);
  text-decoration: none;
  font-weight: 600;
  font-size: .95rem;
  transition: opacity .2s;
}
.result-link:hover { opacity: .8; }

/* Runner up */
.runner-up {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 20px;
}

.runner-up h3 {
  font-size: .9rem;
  color: var(--text-dim);
  font-weight: 600;
  margin-bottom: 14px;
}

.runner-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.runner-item + .runner-item {
  border-top: 1px solid var(--border);
}
.runner-item .ri-icon { font-size: 1.3rem; width: 32px; text-align: center; }
.runner-item .ri-name { font-weight: 600; flex: 1; }
.runner-item .ri-score {
  font-size: .8rem;
  color: var(--accent2);
  font-weight: 600;
}

/* Retry button */
.btn-retry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text);
  padding: 16px;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  font-family: inherit;
}
.btn-retry:hover {
  border-color: var(--accent);
  background: rgba(124,92,252,.06);
}

/* ===== Responsive ===== */
@media (max-width: 520px) {
  .intro-card h1 { font-size: 1.8rem; }
  .question-text { font-size: 1.25rem; }
  .result-card { padding: 28px 20px; }
  .result-name { font-size: 1.6rem; }
  .option-btn { padding: 14px 16px; }
}
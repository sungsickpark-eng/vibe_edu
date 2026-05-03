from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Query # Query 추가
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from typing import List
import os
import io
import shutil
import logging
import json
import tempfile
from uuid import uuid4
from pathlib import Path
import re
import html as html_lib

try:
    import markdown as markdown_lib
except Exception:
    markdown_lib = None

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer
    from reportlab.lib.utils import ImageReader
except Exception:
    A4 = None
    canvas = None
    pdfmetrics = None
    UnicodeCIDFont = None
    ParagraphStyle = None
    Image = None
    Paragraph = None
    SimpleDocTemplate = None
    Spacer = None
    ImageReader = None

try:
    from playwright.sync_api import sync_playwright
except Exception:
    sync_playwright = None

# 커스텀 모듈 임포트
import auth 
from database import engine, get_db
import models
import schemas

# 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="vibe_edu API")

logger = logging.getLogger("vibe_edu.api")

# 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 업로드 경로 설정
UPLOAD_DIR = Path("storage")
UPLOAD_DIR.mkdir(exist_ok=True)
PROJECT_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_EBOOK_ASSET_DIR = PROJECT_ROOT / "frontend" / "public" / "ebook" / "assets"
BACKEND_EBOOK_ASSET_DIR = UPLOAD_DIR / "assets"
BACKEND_EBOOK_ASSET_DIR.mkdir(parents=True, exist_ok=True)

# 업로드 파일을 정적 경로로 제공
app.mount("/storage", StaticFiles(directory=str(UPLOAD_DIR)), name="storage")


def save_uploaded_file(upload_file: UploadFile, folder: str) -> str:
    target_dir = UPLOAD_DIR / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(upload_file.filename or "").suffix.lower()
    generated_name = f"{uuid4().hex}{extension}"
    target_path = target_dir / generated_name

    with target_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    # 프론트에서 바로 사용할 수 있도록 상대 URL 형태로 저장
    return f"storage/{folder}/{generated_name}"


def save_text_file(content: str, folder: str, suffix: str = ".html") -> str:
    target_dir = UPLOAD_DIR / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    generated_name = f"{uuid4().hex}{suffix}"
    target_path = target_dir / generated_name
    target_path.write_text(content, encoding="utf-8")
    return f"storage/{folder}/{generated_name}"


def save_binary_file(content: bytes, folder: str, suffix: str = ".pdf") -> str:
    target_dir = UPLOAD_DIR / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    generated_name = f"{uuid4().hex}{suffix}"
    target_path = target_dir / generated_name
    target_path.write_bytes(content)
    return f"storage/{folder}/{generated_name}"


def _ensure_backend_asset(relative_path: str) -> str | None:
    normalized = relative_path.strip().lstrip("./").replace("\\", "/")
    if not normalized:
        return None

    backend_target = BACKEND_EBOOK_ASSET_DIR / normalized
    if backend_target.exists():
        return f"storage/assets/{normalized}"

    source = FRONTEND_EBOOK_ASSET_DIR / normalized
    if source.exists():
        backend_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, backend_target)
        return f"storage/assets/{normalized}"

    return None


def _resolve_asset_url(raw_path: str, base_file_url: str | None) -> str:
    cleaned = raw_path.strip().replace("\\", "/")
    if not cleaned:
        return ""
    if cleaned.startswith(("http://", "https://", "data:")):
        return cleaned
    if cleaned.startswith("/"):
        return cleaned
    if cleaned.startswith("storage/"):
        return f"/{cleaned}"
    if cleaned.startswith("ebook/"):
        return f"/{cleaned}"

    relative = cleaned.lstrip("./")
    if base_file_url:
        base_dir = Path(base_file_url).parent.as_posix().lstrip("./")
        candidate = Path(base_dir) / relative
        if candidate.exists():
            return f"/{candidate.as_posix()}".replace("//", "/")

    materialized = _ensure_backend_asset(relative)
    if materialized:
        return f"/{materialized}".replace("//", "/")

    return f"/storage/assets/{relative}".replace("//", "/")


def _extract_markdown_images(markdown_text: str, base_file_url: str | None) -> tuple[str, list[dict[str, str]]]:
    images: list[dict[str, str]] = []
    seen_sources: set[str] = set()

    def add_image(src: str, caption: str) -> None:
        if not src or src in seen_sources:
            return
        seen_sources.add(src)
        images.append({"src": src, "caption": caption.strip()})

    def obsidian_repl(match: re.Match[str]) -> str:
        token = match.group(1).strip()
        if "|" in token:
            path_part, caption = token.split("|", 1)
        else:
            path_part, caption = token, ""

        resolved = _resolve_asset_url(path_part, base_file_url)
        alt_text = caption.strip() or Path(path_part.strip()).stem
        add_image(resolved, alt_text)
        return f"![{alt_text}]({resolved})"

    normalized = re.sub(r"!\[\[(.+?)\]\]", obsidian_repl, markdown_text)

    def markdown_repl(match: re.Match[str]) -> str:
        alt = (match.group(1) or "").strip()
        src = (match.group(2) or "").strip()
        resolved = _resolve_asset_url(src, base_file_url)
        add_image(resolved, alt)
        return f"![{alt}]({resolved})"

    normalized = re.sub(r"!\[(.*?)\]\((.+?)\)", markdown_repl, normalized)
    return normalized, images


def _collect_markdown_image_urls(markdown_text: str, base_file_url: str | None) -> list[str]:
    _, images = _extract_markdown_images(markdown_text, base_file_url)
    return [item["src"] for item in images if item.get("src")]


def _decorate_image_cards(html_fragment: str) -> str:
    img_pattern = re.compile(r"<img([^>]*?)>", re.IGNORECASE)

    def _replace_img(match: re.Match[str]) -> str:
        attrs = match.group(1)
        src_match = re.search(r'src=["\']([^"\']+)["\']', attrs, re.IGNORECASE)
        alt_match = re.search(r'alt=["\']([^"\']*)["\']', attrs, re.IGNORECASE)

        src = src_match.group(1) if src_match else ""
        alt = (alt_match.group(1) if alt_match else "").strip() or "카드뉴스 이미지"

        # Hide captions when alt text is just a filename-like token.
        is_filename_like = bool(re.match(r"^[A-Za-z0-9._-]+$", alt))
        show_caption = bool(alt) and not is_filename_like and alt != "카드뉴스 이미지"

        safe_src = html_lib.escape(src, quote=True)
        safe_alt = html_lib.escape(alt)
        caption_html = f"<figcaption>{safe_alt}</figcaption>" if show_caption else ""
        return (
            f'<figure class="image-card-inline">'
            f'<img src="{safe_src}" alt="{safe_alt}" loading="lazy" />'
            f'{caption_html}'
            f'</figure>'
        )

    converted = img_pattern.sub(_replace_img, html_fragment)
    converted = re.sub(
        r"<p>\s*(<figure class=\"image-card-inline\">[\s\S]*?</figure>)\s*</p>",
        r"\1",
        converted,
        flags=re.IGNORECASE,
    )
    return converted


def _split_markdown_chapters(markdown_text: str) -> list[tuple[str, str]]:
    lines = markdown_text.splitlines()
    chapters: list[tuple[str, str]] = []
    current_title = "전체"
    buffer: list[str] = []

    for line in lines:
        if re.match(r"^#\s+", line.strip()):
            if buffer:
                chapters.append((current_title, "\n".join(buffer).strip()))
                buffer = []
            current_title = re.sub(r"^#\s+", "", line.strip()).strip() or "챕터"
        else:
            buffer.append(line)

    if buffer:
        chapters.append((current_title, "\n".join(buffer).strip()))

    if not chapters:
        chapters = [("전체", markdown_text)]

    normalized: list[tuple[str, str]] = []
    for idx, (chapter_title, content) in enumerate(chapters, start=1):
        if chapter_title == "전체" and len(chapters) > 1:
            chapter_title = f"CHAPTER {idx}"
        normalized.append((chapter_title, content))
    return normalized


def render_markdown_to_html(markdown_text: str, title: str, base_file_url: str | None = None) -> str:
    normalized_markdown, _ = _extract_markdown_images(markdown_text, base_file_url)
    chapters = _split_markdown_chapters(normalized_markdown)

    tabs: list[str] = []
    panels: list[str] = []

    for idx, (chapter_title, chapter_md) in enumerate(chapters):
        tab_active = "is-active" if idx == 0 else ""
        panel_active = "is-active" if idx == 0 else ""
        tabs.append(
            f'<button class="chapter-tab {tab_active}" data-target="panel-{idx}" type="button">{html_lib.escape(chapter_title)}</button>'
        )

        if markdown_lib is not None:
            chapter_html = markdown_lib.markdown(
                chapter_md,
                extensions=["extra", "tables", "fenced_code", "sane_lists", "nl2br"],
            )
        else:
            chapter_html = f"<pre>{html_lib.escape(chapter_md)}</pre>"

        chapter_html = _decorate_image_cards(chapter_html)
        panels.append(
            f'<section id="panel-{idx}" class="chapter-panel {panel_active}"><article class="content-card">{chapter_html}</article></section>'
        )

    safe_title = html_lib.escape(title)

    return f"""
<!doctype html>
<html lang=\"ko\">
    <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
        <title>{safe_title}</title>
        <style>
            :root {{
                --bg: #f1f5f9;
                --panel: #ffffff;
                --text: #0f172a;
                --muted: #64748b;
                --line: #dbe4f0;
                --brand: #2563eb;
            }}
            * {{ box-sizing: border-box; }}
            body {{
                margin: 0;
                font-family: "Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                background: radial-gradient(circle at top right, #dbeafe 0%, var(--bg) 42%, #e2e8f0 100%);
                color: var(--text);
            }}
            .shell {{ max-width: 1200px; margin: 0 auto; padding: 24px 16px 48px; }}
            .title-card {{
                background: linear-gradient(135deg, #0f172a, #1e293b 70%);
                color: white;
                border-radius: 20px;
                padding: 20px 24px;
                box-shadow: 0 14px 40px rgba(15, 23, 42, 0.25);
            }}
            .title-card h1 {{ margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.02em; }}
            .title-card p {{ margin: 8px 0 0; color: #cbd5e1; font-size: 14px; font-weight: 600; }}
            .layout {{ margin-top: 16px; display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; align-items: start; }}
            .chapter-nav {{
                position: sticky;
                top: 16px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid var(--line);
                border-radius: 16px;
                backdrop-filter: blur(6px);
                padding: 10px;
            }}
            .chapter-tab {{
                width: 100%;
                border: 0;
                background: transparent;
                text-align: left;
                border-radius: 10px;
                padding: 11px 12px;
                color: #334155;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                transition: all .2s ease;
            }}
            .chapter-tab:hover {{ background: #eff6ff; color: #1e40af; }}
            .chapter-tab.is-active {{ background: linear-gradient(135deg, #dbeafe, #e0e7ff); color: #1d4ed8; }}
            .chapter-panel {{ display: none; }}
            .chapter-panel.is-active {{
                display: block;
                animation: panelFadeIn .35s ease;
            }}
            .content-card {{
                background: var(--panel);
                border-radius: 18px;
                border: 1px solid var(--line);
                box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
                padding: 28px;
                line-height: 1.84;
                font-size: 17px;
            }}
            .content-card h1, .content-card h2, .content-card h3 {{ line-height: 1.28; margin: 1.2em 0 0.55em; font-weight: 900; letter-spacing: -0.01em; }}
            .content-card h1 {{ font-size: 34px; }}
            .content-card h2 {{ font-size: 28px; color: #1e3a8a; }}
            .content-card h3 {{ font-size: 22px; color: #1d4ed8; }}
            .content-card p {{ margin: 0.55em 0; }}
            .content-card .image-card-inline {{
                margin: 22px 0;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid #dbe4f0;
                background: #f8fafc;
                box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
                padding: 14px;
                transform: translateY(16px);
                opacity: 0;
                transition: transform .45s ease, opacity .45s ease, box-shadow .2s ease;
                will-change: transform, opacity;
            }}
            .content-card .image-card-inline.is-visible {{
                transform: translateY(0);
                opacity: 1;
            }}
            .content-card .image-card-inline:hover {{
                box-shadow: 0 14px 36px rgba(15, 23, 42, 0.22);
            }}
            .content-card .image-card-inline img {{
                display: block;
                width: auto;
                height: auto;
                max-width: 100%;
                max-height: 640px;
                object-fit: contain;
                background: #e2e8f0;
                margin: 0 auto;
                cursor: zoom-in;
                transition: transform .22s ease, filter .22s ease;
            }}
            .content-card .image-card-inline img:hover {{
                transform: scale(1.01);
                filter: saturate(1.05);
            }}
            .content-card .image-card-inline figcaption {{
                margin: 0;
                padding: 10px 12px;
                font-size: 13px;
                font-weight: 800;
                color: #334155;
                background: #ffffff;
                border-top: 1px solid #dbe4f0;
            }}
            .content-card pre {{ overflow-x: auto; padding: 16px; border-radius: 12px; background: #0f172a; color: #e2e8f0; }}
            .content-card code {{ background: #e2e8f0; padding: 2px 6px; border-radius: 6px; font-size: .95em; }}
            .content-card pre code {{ background: transparent; padding: 0; }}
            .content-card ul, .content-card ol {{ padding-left: 24px; }}
            .content-card li {{ margin: 6px 0; }}
            .content-card blockquote {{ border-left: 4px solid #60a5fa; margin: 20px 0; padding: 8px 16px; background: #eff6ff; border-radius: 0 10px 10px 0; }}
            .content-card table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            .content-card th, .content-card td {{ border: 1px solid #cbd5e1; padding: 10px; text-align: left; }}
            .content-card th {{ background: #f1f5f9; font-weight: 800; }}
            .lightbox-overlay {{
                position: fixed;
                inset: 0;
                z-index: 9999;
                background: rgba(2, 6, 23, 0.88);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity .25s ease;
            }}
            .lightbox-overlay.is-open {{
                opacity: 1;
                pointer-events: auto;
            }}
            .lightbox-dialog {{
                width: min(94vw, 1280px);
                max-height: 90vh;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid rgba(148, 163, 184, 0.35);
                background: #020617;
                box-shadow: 0 30px 80px rgba(2, 6, 23, 0.5);
                transform: scale(0.95) translateY(10px);
                transition: transform .25s ease;
            }}
            .lightbox-overlay.is-open .lightbox-dialog {{
                transform: scale(1) translateY(0);
            }}
            .lightbox-image-wrap {{
                width: 100%;
                max-height: 82vh;
                overflow: auto;
                background: #020617;
            }}
            .lightbox-image {{
                display: block;
                margin: 0 auto;
                width: auto;
                height: auto;
                max-width: 100%;
                max-height: 82vh;
                object-fit: contain;
            }}
            .lightbox-toolbar {{
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                padding: 10px;
                background: #0f172a;
                border-top: 1px solid rgba(148, 163, 184, 0.24);
            }}
            .lightbox-close {{
                border: 0;
                border-radius: 10px;
                padding: 8px 12px;
                background: #1e293b;
                color: #e2e8f0;
                font-size: 12px;
                font-weight: 800;
                cursor: pointer;
                transition: background .2s ease;
            }}
            .lightbox-close:hover {{ background: #334155; }}
            @keyframes panelFadeIn {{
                from {{ opacity: 0; transform: translateY(6px); }}
                to {{ opacity: 1; transform: translateY(0); }}
            }}
            @media (max-width: 960px) {{
                .layout {{ grid-template-columns: 1fr; }}
                .chapter-nav {{ position: static; display: flex; gap: 8px; overflow-x: auto; white-space: nowrap; }}
                .chapter-tab {{ width: auto; min-width: 150px; }}
                .content-card {{ padding: 20px; font-size: 16px; }}
                .title-card h1 {{ font-size: 24px; }}
            }}
        </style>
    </head>
    <body>
        <main class=\"shell\">
            <header class=\"title-card\">
                <h1>{safe_title}</h1>
                <p>MD 자동 생성 뷰어 • 챕터 탭 기반 리더</p>
            </header>
            <div class=\"layout\">
                <nav class=\"chapter-nav\">{"".join(tabs)}</nav>
                <section>{"".join(panels)}</section>
            </div>
        </main>
        <div class="lightbox-overlay" id="image-lightbox" aria-hidden="true">
            <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="이미지 확대 보기">
                <div class="lightbox-image-wrap">
                    <img class="lightbox-image" id="lightbox-image" alt="확대 이미지" />
                </div>
                <div class="lightbox-toolbar">
                    <button type="button" class="lightbox-close" id="lightbox-close">닫기</button>
                </div>
            </div>
        </div>
        <script>
            const tabs = Array.from(document.querySelectorAll('.chapter-tab'));
            const panels = Array.from(document.querySelectorAll('.chapter-panel'));
            const lightbox = document.getElementById('image-lightbox');
            const lightboxImage = document.getElementById('lightbox-image');
            const lightboxClose = document.getElementById('lightbox-close');

            const applyInlineImageScale = () => {{
                const images = Array.from(document.querySelectorAll('.image-card-inline img'));
                images.forEach((img) => {{
                    const naturalW = img.naturalWidth || 0;
                    const naturalH = img.naturalHeight || 0;
                    if (!naturalW || !naturalH) return;

                    const card = img.closest('.image-card-inline');
                    const cardWidth = card ? card.clientWidth - 28 : img.clientWidth;
                    const maxAllowedW = cardWidth > 0 ? cardWidth : naturalW;

                    // Keep original size by default; scale up tiny images up to 2x only.
                    const targetW = naturalW < 560 ? Math.min(naturalW * 2, maxAllowedW) : Math.min(naturalW, maxAllowedW);
                    img.style.width = `${{targetW}}px`;
                    img.style.height = 'auto';
                }});
            }};

            const bindImageLightbox = () => {{
                const images = Array.from(document.querySelectorAll('.image-card-inline img'));
                images.forEach((img) => {{
                    if (img.dataset.lightboxBound === '1') return;
                    img.dataset.lightboxBound = '1';
                    img.addEventListener('click', () => {{
                        if (!lightbox || !lightboxImage) return;
                        const src = img.getAttribute('src');
                        if (!src) return;
                        lightboxImage.setAttribute('src', src);
                        lightboxImage.setAttribute('alt', img.getAttribute('alt') || '확대 이미지');
                        lightbox.classList.add('is-open');
                        lightbox.setAttribute('aria-hidden', 'false');
                        document.body.style.overflow = 'hidden';
                    }});
                }});
            }};

            const closeLightbox = () => {{
                if (!lightbox || !lightboxImage) return;
                lightbox.classList.remove('is-open');
                lightbox.setAttribute('aria-hidden', 'true');
                lightboxImage.setAttribute('src', '');
                document.body.style.overflow = '';
            }};

            const applyRevealAnimation = () => {{
                const cards = Array.from(document.querySelectorAll('.image-card-inline'));
                if (!('IntersectionObserver' in window)) {{
                    cards.forEach((card) => card.classList.add('is-visible'));
                    return;
                }}

                const observer = new IntersectionObserver((entries) => {{
                    entries.forEach((entry) => {{
                        if (entry.isIntersecting) {{
                            entry.target.classList.add('is-visible');
                        }}
                    }});
                }}, {{ threshold: 0.16 }});

                cards.forEach((card) => observer.observe(card));
            }};

            window.addEventListener('load', applyInlineImageScale);
            window.addEventListener('resize', applyInlineImageScale);
            window.addEventListener('load', bindImageLightbox);
            window.addEventListener('load', applyRevealAnimation);

            if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
            if (lightbox) {{
                lightbox.addEventListener('click', (event) => {{
                    if (event.target === lightbox) closeLightbox();
                }});
            }}
            document.addEventListener('keydown', (event) => {{
                if (event.key === 'Escape') closeLightbox();
            }});

            tabs.forEach((tab) => {{
                tab.addEventListener('click', () => {{
                    const target = tab.getAttribute('data-target');
                    tabs.forEach((t) => t.classList.remove('is-active'));
                    panels.forEach((p) => p.classList.remove('is-active'));
                    tab.classList.add('is-active');
                    const panel = document.getElementById(target);
                    if (panel) panel.classList.add('is-active');
                    applyInlineImageScale();
                    bindImageLightbox();
                    applyRevealAnimation();
                }});
            }});
        </script>
    </body>
</html>
"""


def _markdown_to_plain_text(markdown_text: str) -> str:
    text = markdown_text
    text = re.sub(r"```[\s\S]*?```", "\n", text)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^\)]*\)", "[image]", text)
    text = re.sub(r"\[[^\]]*\]\([^\)]*\)", "", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s?", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*|__|\*|_", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _html_to_plain_text(html_content: str) -> str:
    text = html_content

    body_match = re.search(r"<body[^>]*>([\s\S]*?)</body>", text, re.IGNORECASE)
    if body_match:
        text = body_match.group(1)

    text = re.sub(r"<script[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<style[\s\S]*?</style>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</(p|div|section|article|figure|figcaption|h1|h2|h3|h4|h5|h6|li|blockquote|pre|table|tr)>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<li[^>]*>", "- ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html_lib.unescape(text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


_PDF_FONT_NAME: str | None = None


def _get_pdf_font_name() -> str:
    global _PDF_FONT_NAME
    if _PDF_FONT_NAME:
        return _PDF_FONT_NAME

    if pdfmetrics is not None and UnicodeCIDFont is not None:
        for font_name in ("HYSMyeongJo-Medium", "HYGothic-Medium", "HeiseiKakuGo-W5"):
            try:
                pdfmetrics.registerFont(UnicodeCIDFont(font_name))
                _PDF_FONT_NAME = font_name
                return _PDF_FONT_NAME
            except Exception:
                continue

    _PDF_FONT_NAME = "Helvetica"
    return _PDF_FONT_NAME


def render_markdown_to_pdf_bytes(markdown_text: str, title: str) -> bytes:
    if canvas is None or A4 is None:
        raise HTTPException(status_code=500, detail="PDF 생성 라이브러리(reportlab)가 설치되어 있지 않습니다.")

    if markdown_lib is not None:
        html_content = markdown_lib.markdown(
            markdown_text,
            extensions=["extra", "tables", "fenced_code", "sane_lists", "nl2br"],
        )
    else:
        html_content = f"<pre>{html_lib.escape(markdown_text)}</pre>"

    return render_html_to_pdf_bytes(html_content, title)


def _resolve_pdf_image_path(src: str) -> Path | None:
    cleaned = (src or "").strip()
    if not cleaned:
        return None
    if cleaned.startswith(("http://", "https://", "data:")):
        return None

    cleaned = cleaned.replace("\\", "/")
    if cleaned.startswith("/storage/"):
        return Path(cleaned.lstrip("/"))
    if cleaned.startswith("storage/"):
        return Path(cleaned)
    if cleaned.startswith("/ebook/"):
        candidate = PROJECT_ROOT / "frontend" / "public" / cleaned.lstrip("/")
        return candidate
    if cleaned.startswith("ebook/"):
        candidate = PROJECT_ROOT / "frontend" / "public" / cleaned
        return candidate

    relative = cleaned.lstrip("/")
    candidate = Path(relative)
    return candidate


def _extract_html_blocks_for_pdf(html_content: str) -> list[dict[str, str]]:
    text = html_content
    body_match = re.search(r"<body[^>]*>([\s\S]*?)</body>", text, re.IGNORECASE)
    if body_match:
        text = body_match.group(1)

    text = re.sub(r"<script[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<style[\s\S]*?</style>", "", text, flags=re.IGNORECASE)

    parts = re.split(r"(<img[^>]*?>)", text, flags=re.IGNORECASE)
    blocks: list[dict[str, str]] = []

    for part in parts:
        if not part:
            continue

        if re.match(r"<img[^>]*?>", part, flags=re.IGNORECASE):
            src_match = re.search(r'src=["\']([^"\']+)["\']', part, flags=re.IGNORECASE)
            if src_match:
                blocks.append({"type": "image", "src": src_match.group(1).strip()})
            continue

        normalized = re.sub(r"<br\s*/?>", "\n", part, flags=re.IGNORECASE)
        normalized = re.sub(
            r"</(p|div|section|article|figure|figcaption|h1|h2|h3|h4|h5|h6|li|blockquote|pre|table|tr|ul|ol)>",
            "\n",
            normalized,
            flags=re.IGNORECASE,
        )
        normalized = re.sub(r"<li[^>]*>", "- ", normalized, flags=re.IGNORECASE)
        normalized = re.sub(r"<[^>]+>", "", normalized)
        normalized = html_lib.unescape(normalized)
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)
        normalized = normalized.strip()
        if normalized:
            blocks.append({"type": "text", "text": normalized})

    return blocks


def _rewrite_html_asset_paths_for_pdf(html_content: str) -> str:
    storage_root = UPLOAD_DIR.resolve()
    frontend_public = (PROJECT_ROOT / "frontend" / "public").resolve()

    def _replace_path(raw_path: str) -> str:
        path = (raw_path or "").strip()
        if not path:
            return path
        if path.startswith(("http://", "https://", "data:", "file://")):
            return path

        normalized = path.replace("\\", "/")

        if normalized.startswith("/storage/"):
            target = storage_root / normalized[len("/storage/"):]
            return target.resolve().as_uri()
        if normalized.startswith("storage/"):
            target = storage_root / normalized[len("storage/"):]
            return target.resolve().as_uri()
        if normalized.startswith("/ebook/"):
            target = frontend_public / normalized[len("/"):]
            return target.resolve().as_uri()
        if normalized.startswith("ebook/"):
            target = frontend_public / normalized
            return target.resolve().as_uri()

        candidate = Path(normalized)
        if candidate.exists():
            return candidate.resolve().as_uri()

        return path

    attr_pattern = re.compile(r'(src|href)=("|\')(.*?)(\2)', re.IGNORECASE)

    def _attr_repl(match: re.Match[str]) -> str:
        key = match.group(1)
        quote = match.group(2)
        value = match.group(3)
        rewritten = _replace_path(value)
        return f"{key}={quote}{rewritten}{quote}"

    return attr_pattern.sub(_attr_repl, html_content)


def _render_html_to_pdf_bytes_playwright(html_content: str, title: str) -> bytes:
    if sync_playwright is None:
        raise RuntimeError("playwright is not available")

    rewritten_html = _rewrite_html_asset_paths_for_pdf(html_content)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".html", delete=False, encoding="utf-8") as tmp:
        tmp.write(rewritten_html)
        tmp_path = Path(tmp.name)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1440, "height": 2000})
            page.goto(tmp_path.resolve().as_uri(), wait_until="networkidle")

            page.add_style_tag(
                content="""
                .chapter-nav { display: none !important; }
                .chapter-panel { display: block !important; }
                .chapter-panel:not(:first-child) { margin-top: 20px !important; }
                body { background: #ffffff !important; }
                .image-card-inline,
                .content-card .image-card-inline {
                    opacity: 1 !important;
                    transform: none !important;
                    transition: none !important;
                }
                .content-card .image-card-inline img {
                    filter: none !important;
                }
                """
            )

            page.evaluate(
                """
                async () => {
                    const imgs = Array.from(document.querySelectorAll('img'));
                    imgs.forEach((img) => {
                        img.loading = 'eager';
                        img.decoding = 'sync';
                    });

                    await Promise.all(
                        imgs.map((img) => {
                            if (img.complete) return Promise.resolve();
                            return new Promise((resolve) => {
                                img.addEventListener('load', () => resolve(null), { once: true });
                                img.addEventListener('error', () => resolve(null), { once: true });
                            });
                        })
                    );

                    window.scrollTo(0, document.body.scrollHeight);
                    await new Promise((resolve) => setTimeout(resolve, 250));
                    window.scrollTo(0, 0);
                }
                """
            )

            pdf_bytes = page.pdf(
                format="A4",
                print_background=True,
                display_header_footer=False,
                margin={"top": "14mm", "right": "12mm", "bottom": "14mm", "left": "12mm"},
            )
            browser.close()
            return pdf_bytes
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass


def render_html_to_pdf_bytes(html_content: str, title: str) -> bytes:
    try:
        return _render_html_to_pdf_bytes_playwright(html_content, title)
    except Exception as e:
        logger.warning("Playwright PDF generation failed, fallback to ReportLab: %s", e)

    if (
        canvas is None
        or A4 is None
        or ParagraphStyle is None
        or Paragraph is None
        or Image is None
        or SimpleDocTemplate is None
        or Spacer is None
        or ImageReader is None
    ):
        raise HTTPException(status_code=500, detail="PDF 생성 라이브러리(reportlab)가 설치되어 있지 않습니다.")

    blocks = _extract_html_blocks_for_pdf(html_content)
    packet = io.BytesIO()
    doc = SimpleDocTemplate(
        packet,
        pagesize=A4,
        leftMargin=44,
        rightMargin=44,
        topMargin=48,
        bottomMargin=48,
        title=title,
    )
    font_name = _get_pdf_font_name()

    title_style = ParagraphStyle(
        "PdfTitle",
        fontName=font_name,
        fontSize=16,
        leading=22,
        spaceAfter=12,
    )
    body_style = ParagraphStyle(
        "PdfBody",
        fontName=font_name,
        fontSize=11,
        leading=17,
        spaceAfter=8,
    )

    story = [Paragraph(html_lib.escape(title), title_style), Spacer(1, 8)]

    max_image_width = doc.width
    max_image_height = A4[1] * 0.52

    for block in blocks:
        if block.get("type") == "image":
            image_path = _resolve_pdf_image_path(block.get("src", ""))
            if image_path and image_path.exists():
                try:
                    img_reader = ImageReader(str(image_path))
                    img_w, img_h = img_reader.getSize()
                    if img_w > 0 and img_h > 0:
                        scale = min(max_image_width / img_w, max_image_height / img_h, 1.0)
                        flow_img = Image(str(image_path), width=img_w * scale, height=img_h * scale)
                        story.append(flow_img)
                        story.append(Spacer(1, 10))
                except Exception:
                    continue
            continue

        text_block = (block.get("text") or "").strip()
        if not text_block:
            continue

        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text_block) if p.strip()]
        for para in paragraphs:
            safe_para = html_lib.escape(para).replace("\n", "<br/>")
            story.append(Paragraph(safe_para, body_style))

    if len(story) <= 2:
        fallback_text = _html_to_plain_text(html_content)
        for para in [p.strip() for p in re.split(r"\n\s*\n", fallback_text) if p.strip()]:
            safe_para = html_lib.escape(para).replace("\n", "<br/>")
            story.append(Paragraph(safe_para, body_style))

    doc.build(story)
    packet.seek(0)
    return packet.read()

# --- 경로(Route) 정의 시작 ---

@app.get("/")
def read_root():
    return {"message": "vibe_edu API is running"}

# 1. 강의 목록 조회 (프론트엔드 메인 페이지용)
# 프론트엔드에서 fetch("http://127.0.0.1:8000/api/lectures") 로 호출한다면 아래 경로가 맞습니다.
@app.get("/api/lectures", response_model=List[schemas.LectureResponse])
def read_lectures(db: Session = Depends(get_db)):
    try:
        return db.query(models.Lecture).order_by(models.Lecture.id.desc()).all()
    except SQLAlchemyError as e:
        logger.exception("Failed to fetch lectures")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "강의 목록 조회 중 데이터베이스 오류가 발생했습니다.",
                "error_type": e.__class__.__name__,
            },
        )


@app.get("/api/health/db")
def health_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except SQLAlchemyError as e:
        logger.exception("Database health check failed")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "데이터베이스 연결 상태가 비정상입니다.",
                "error_type": e.__class__.__name__,
            },
        )

@app.get("/api/lectures/{lecture_id}", response_model=schemas.LectureResponse)
def read_lecture(lecture_id: int, db: Session = Depends(get_db)):
    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다.")
    return lecture


@app.get("/api/v1/lectures/{lecture_id}/access")
def lecture_access(
    lecture_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="유효하지 않은 사용자입니다.")

    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다.")

    is_purchased = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id,
        models.Purchase.lecture_id == lecture_id,
    ).first() is not None

    can_view = bool(user.is_admin or is_purchased)
    return {
        "lecture_id": lecture_id,
        "is_admin": bool(user.is_admin),
        "is_purchased": is_purchased,
        "can_view": can_view,
    }

# 2. 강의 업로드 (Admin 전용)
@app.post("/api/v1/admin/upload")
async def upload_lecture(
    title: str = Form(...),
    description: str = Form(None),
    category: str = Form(...),
    file: UploadFile = File(...),
    cover_image: UploadFile = File(...),
    thumbnail_images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="관리자만 업로드할 수 있습니다.")

    category_upper = category.upper()

    if cover_image.content_type is None or not cover_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="표지는 이미지 파일만 업로드할 수 있습니다.")

    if len(thumbnail_images) > 10:
        raise HTTPException(status_code=400, detail="썸네일은 최대 10개까지 등록할 수 있습니다.")

    for thumb in thumbnail_images:
        if thumb.content_type is None or not thumb.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="썸네일은 이미지 파일만 업로드할 수 있습니다.")

    file_url = save_uploaded_file(file, "books")
    cover_image_url = save_uploaded_file(cover_image, "covers")

    thumbnail_urls: List[str] = []
    for thumb in thumbnail_images:
        thumbnail_urls.append(save_uploaded_file(thumb, "thumbnails"))
    
    md_file_url = None
    html_file_url = None

    if category_upper == "MD":
        if not (file.filename or "").lower().endswith(".md"):
            raise HTTPException(status_code=400, detail="MD 카테고리는 .md 파일만 업로드할 수 있습니다.")

        md_file_url = file_url
        markdown_text = Path(md_file_url).read_text(encoding="utf-8")
        html_content = render_markdown_to_html(markdown_text, title, base_file_url=md_file_url)
        html_file_url = save_text_file(html_content, "html", suffix=".html")
        pdf_content = render_html_to_pdf_bytes(html_content, title)
        file_url = save_binary_file(pdf_content, "pdf", suffix=".pdf")
        thumbnail_urls.extend(_collect_markdown_image_urls(markdown_text, md_file_url))

    # 중복 경로 제거
    thumbnail_urls = list(dict.fromkeys(thumbnail_urls))

    new_lecture = models.Lecture(
        title=title,
        description=description,
        category=category_upper,
        file_url=file_url,
        cover_image_url=cover_image_url,
        thumbnail_urls=json.dumps(thumbnail_urls, ensure_ascii=False),
        md_file_url=md_file_url,
        html_file_url=html_file_url,
    )
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)
    return {
        "message": "업로드 성공",
        "id": new_lecture.id,
        "category": new_lecture.category,
        "md_file_url": new_lecture.md_file_url,
        "html_file_url": new_lecture.html_file_url,
    }


@app.get("/api/v1/admin/lectures/{lecture_id}/markdown")
def get_markdown_content(
    lecture_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="관리자만 접근할 수 있습니다.")

    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다.")
    if lecture.category != "MD" or not lecture.md_file_url:
        raise HTTPException(status_code=400, detail="MD 전자책이 아닙니다.")

    md_path = Path(lecture.md_file_url)
    if not md_path.exists():
        raise HTTPException(status_code=404, detail="MD 파일을 찾을 수 없습니다.")

    markdown_content = md_path.read_text(encoding="utf-8")
    return {
        "lecture_id": lecture.id,
        "title": lecture.title,
        "markdown_content": markdown_content,
        "html_file_url": lecture.html_file_url,
    }


@app.put("/api/v1/admin/lectures/{lecture_id}/markdown")
def update_markdown_content(
    lecture_id: int,
    payload: schemas.MarkdownUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="관리자만 수정할 수 있습니다.")

    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다.")
    if lecture.category != "MD" or not lecture.md_file_url:
        raise HTTPException(status_code=400, detail="MD 전자책이 아닙니다.")

    md_path = Path(lecture.md_file_url)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(payload.markdown_content, encoding="utf-8")

    html_content = render_markdown_to_html(payload.markdown_content, lecture.title, base_file_url=lecture.md_file_url)
    if lecture.html_file_url:
        html_path = Path(lecture.html_file_url)
        html_path.parent.mkdir(parents=True, exist_ok=True)
        html_path.write_text(html_content, encoding="utf-8")
    else:
        lecture.html_file_url = save_text_file(html_content, "html", suffix=".html")

    pdf_content = render_html_to_pdf_bytes(html_content, lecture.title)
    if lecture.file_url and lecture.file_url.lower().endswith(".pdf"):
        pdf_path = Path(lecture.file_url)
        pdf_path.parent.mkdir(parents=True, exist_ok=True)
        pdf_path.write_bytes(pdf_content)
    else:
        lecture.file_url = save_binary_file(pdf_content, "pdf", suffix=".pdf")

    image_urls = _collect_markdown_image_urls(payload.markdown_content, lecture.md_file_url)
    lecture.thumbnail_urls = json.dumps(image_urls, ensure_ascii=False)

    db.commit()
    return {
        "message": "MD 파일이 저장되고 HTML이 재생성되었습니다.",
        "lecture_id": lecture.id,
        "html_file_url": lecture.html_file_url,
    }


@app.put("/api/v1/admin/lectures/{lecture_id}")
def update_lecture_meta(
    lecture_id: int,
    payload: schemas.AdminLectureUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="관리자만 수정할 수 있습니다.")

    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다.")

    next_category = payload.category.upper().strip()
    if not next_category:
        raise HTTPException(status_code=400, detail="카테고리를 입력해주세요.")

    lecture.title = payload.title.strip()
    lecture.description = payload.description
    lecture.category = next_category

    db.commit()
    db.refresh(lecture)
    return {
        "message": "전자책 정보가 수정되었습니다.",
        "lecture": lecture,
    }


@app.delete("/api/v1/admin/lectures/{lecture_id}")
def delete_lecture(
    lecture_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="관리자만 삭제할 수 있습니다.")

    lecture = db.query(models.Lecture).filter(models.Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="강의를 찾을 수 없습니다.")

    purchases = db.query(models.Purchase).filter(models.Purchase.lecture_id == lecture_id).all()
    for purchase in purchases:
        db.delete(purchase)

    db.delete(lecture)
    db.commit()
    return {"message": "전자책이 삭제되었습니다."}

# 3. 회원가입
@app.post("/api/v1/signup")
def signup(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")
    
    new_user = models.User(
        email=email,
        hashed_password=auth.get_password_hash(password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "회원가입 성공"}

# 4. 로그인
@app.post("/api/v1/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")
    
    access_token = auth.create_access_token(data={"sub": user.email, "is_admin": user.is_admin})
    return {"access_token": access_token, "token_type": "bearer"}

# 5. 구매하기
@app.post("/api/v1/purchase/{lecture_id}")
def purchase_lecture(
    lecture_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    existing = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id, 
        models.Purchase.lecture_id == lecture_id
    ).first()
    
    if existing:
        return {"message": "이미 구매한 강의입니다."}

    new_purchase = models.Purchase(user_id=user.id, lecture_id=lecture_id)
    db.add(new_purchase)
    db.commit()
    return {"message": "구매가 완료되었습니다."}

# 5.1. 열람 기록 저장 (열람 횟수 및 시간 기록)
@app.post("/api/v1/purchases/{lecture_id}/log")
def log_view(
    lecture_id: int, 
    log_data: schemas.ViewLogRequest,
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="유효하지 않은 사용자입니다.")
        
    purchase = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id, 
        models.Purchase.lecture_id == lecture_id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=403, detail="구매 내역이 없습니다.")
        
    if log_data.is_new_view:
        purchase.view_count += 1
    
    purchase.total_view_time += log_data.duration
    db.commit()
    
    return {
        "message": "시청 기록이 업데이트되었습니다.", 
        "view_count": purchase.view_count, 
        "total_view_time": purchase.total_view_time
    }

# 6. 보안 스트리밍 (권한 체크 포함)
@app.get("/api/v1/contents/{content_id}/stream")
async def stream_pdf(
    content_id: int,
    db: Session = Depends(get_db),
    token: str | None = Query(None),
    authorization: str | None = Header(None),
):
    auth_token = token
    if not auth_token and authorization:
        bearer_prefix = "bearer "
        if authorization.lower().startswith(bearer_prefix):
            auth_token = authorization[len(bearer_prefix):].strip()

    if not auth_token:
        raise HTTPException(status_code=401, detail="토큰이 필요합니다.")

    user_info = auth.get_current_user(auth_token)
    user = db.query(models.User).filter(models.User.email == user_info["email"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="유효하지 않은 사용자입니다.")

    is_purchased = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id,
        models.Purchase.lecture_id == content_id,
    ).first()
    if not is_purchased and not user.is_admin:
        raise HTTPException(status_code=403, detail="강의 구매가 필요합니다.")

    content = db.query(models.Lecture).filter(models.Lecture.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    file_path = content.file_url
    if content.category == "MD" and (not file_path or file_path.lower().endswith(".md")):
        md_path = content.md_file_url or file_path
        if not md_path or not os.path.exists(md_path):
            raise HTTPException(status_code=404, detail="MD 원본 파일을 찾을 수 없습니다.")

        markdown_text = Path(md_path).read_text(encoding="utf-8")
        html_content = render_markdown_to_html(markdown_text, content.title, base_file_url=md_path)
        pdf_content = render_html_to_pdf_bytes(html_content, content.title)
        generated_pdf_url = save_binary_file(pdf_content, "pdf", suffix=".pdf")

        content.file_url = generated_pdf_url
        db.commit()
        file_path = generated_pdf_url

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    def iterfile():
        with open(file_path, mode="rb") as f:
            yield from f

    return StreamingResponse(iterfile(), media_type="application/pdf")
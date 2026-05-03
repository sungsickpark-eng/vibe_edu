"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, FileText, ListChecks, X } from "lucide-react";
import Navbar from "@/components/Navbar";

type ChapterTab = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
};

const encodePathSegments = (path: string): string =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const resolveImageSrc = (rawPath: string): string => {
  const clean = rawPath.trim().replace(/^\/+/, "");
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("ebook/")) return `/${encodePathSegments(clean)}`;
  return `/ebook/assets/${encodePathSegments(clean)}`;
};

const renderInlineText = (text: string): ReactNode[] => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`strong-${index}`} className="font-black text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
};

const splitIntoTabs = (fullText: string): ChapterTab[] => {
  const headingRegex = /^#\s+(CHAPTER\s+\d+\.[^\n]*|부록:\s*[^\n]*)\s*$/gm;
  const matches = [...fullText.matchAll(headingRegex)];

  if (matches.length === 0) {
    return [
      {
        id: "full",
        title: "전체",
        subtitle: "전자책 전체",
        content: fullText,
      },
    ];
  }

  const tabs: ChapterTab[] = [];

  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? fullText.length) : fullText.length;
    const headerRaw = matches[i][1].trim();
    const body = fullText.slice(start, end).trim();

    const chapterMatch = headerRaw.match(/^CHAPTER\s+(\d+)\./i);
    const isAppendix = /^부록:/i.test(headerRaw);

    tabs.push({
      id: `tab-${i}`,
      title: isAppendix ? "부록" : chapterMatch ? `CH ${chapterMatch[1]}` : `CH ${i + 1}`,
      subtitle: headerRaw,
      content: body,
    });
  }

  return tabs;
};

export default function EbookReaderPage() {
  const router = useRouter();
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000");
  const [rawBook, setRawBook] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [testLectureId, setTestLectureId] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      setApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);
      return;
    }

    if (typeof window === "undefined") return;

    const host = window.location.hostname || "localhost";
    const protocol = window.location.protocol || "http:";

    if (host !== "localhost" && host !== "127.0.0.1") {
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

  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await fetch("/ebook/full-book.md");
        const text = await res.text();
        setRawBook(text);
      } catch (error) {
        console.error("Failed to load ebook markdown", error);
      }
    };

    loadBook();
  }, []);

  useEffect(() => {
    const loadTestLectureId = async () => {
      try {
        const res = await fetch(`${apiBase}/api/lectures`);
        if (!res.ok) return;
        const data = await res.json();
        const testLecture = data.find((lecture: { id: number; title: string }) =>
          lecture.title?.includes("테스트 전자책"),
        );
        if (testLecture?.id) {
          setTestLectureId(testLecture.id);
        }
      } catch (error) {
        // Fallback to default ID(1) if backend is temporarily unavailable.
      }
    };

    loadTestLectureId();
  }, [apiBase]);

  const tabs = useMemo(() => splitIntoTabs(rawBook), [rawBook]);

  const activeChapter = useMemo(
    () => tabs.find((chapter) => chapter.id === activeTab) ?? tabs[0],
    [activeTab, tabs],
  );

  useEffect(() => {
    if (!activeTab && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, tabs]);

  const checklist = useMemo(() => {
    if (!activeChapter) return [];
    return activeChapter.content
      .split("\n")
      .filter((line) => line.trim().startsWith("- [ ]"))
      .map((line) => line.replace("- [ ]", "").trim());
  }, [activeChapter]);

  const renderChapterContent = (content: string): ReactNode[] => {
    const lines = content.split("\n");
    const elements: ReactNode[] = [];
    let i = 0;

    const blockStartRegex = /^(#{1,4}\s+|!\[\[|!\[|>\s+|[-*]\s+|\d+\.\s+|```|\|.*\||---+$)/;

    while (i < lines.length) {
      const currentLine = lines[i];
      const line = currentLine.trim();

      if (!line) {
        i += 1;
        continue;
      }

      const obsidianImage = line.match(/^!\[\[(.+?)\]\]$/);
      if (obsidianImage) {
        const imageToken = obsidianImage[1].trim();
        const [pathPart, captionPart] = imageToken.split("|");
        const src = resolveImageSrc(pathPart);
        const fileName = pathPart.trim();
        const caption = (captionPart ?? "").trim();
        const showCaption = caption.length > 0 && caption !== fileName;
        const isBroken = brokenImages[src];

        elements.push(
          <figure key={`img-${i}`} className="group my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {!isBroken ? (
              <button
                type="button"
                onClick={() => {
                  setLightboxSrc(src);
                  setLightboxAlt(caption);
                }}
                className="relative block w-full overflow-hidden"
                title="클릭해서 크게 보기"
              >
                <img
                  src={src}
                  alt={showCaption ? caption : "ebook-image"}
                  loading="lazy"
                  onError={() => setBrokenImages((prev) => ({ ...prev, [src]: true }))}
                  className="max-h-130 w-full bg-slate-100 object-contain transition duration-500 group-hover:scale-[1.02] dark:bg-slate-800"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </button>
            ) : (
              <div className="flex min-h-40 items-center justify-center bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                이미지를 찾을 수 없습니다: {pathPart}
              </div>
            )}
            {showCaption && (
              <figcaption className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300">{caption}</figcaption>
            )}
          </figure>,
        );
        i += 1;
        continue;
      }

      const markdownImage = line.match(/^!\[(.*?)\]\((.+?)\)$/);
      if (markdownImage) {
        const alt = (markdownImage[1] || "").trim();
        const showCaption = alt.length > 0;
        const src = resolveImageSrc(markdownImage[2]);
        const isBroken = brokenImages[src];

        elements.push(
          <figure key={`md-img-${i}`} className="group my-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {!isBroken ? (
              <button
                type="button"
                onClick={() => {
                  setLightboxSrc(src);
                  setLightboxAlt(alt);
                }}
                className="relative block w-full overflow-hidden"
                title="클릭해서 크게 보기"
              >
                <img
                  src={src}
                  alt={showCaption ? alt : "ebook-image"}
                  loading="lazy"
                  onError={() => setBrokenImages((prev) => ({ ...prev, [src]: true }))}
                  className="max-h-130 w-full bg-slate-100 object-contain transition duration-500 group-hover:scale-[1.02] dark:bg-slate-800"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </button>
            ) : (
              <div className="flex min-h-40 items-center justify-center bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                이미지를 찾을 수 없습니다: {markdownImage[2]}
              </div>
            )}
            {showCaption && (
              <figcaption className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300">{alt}</figcaption>
            )}
          </figure>,
        );
        i += 1;
        continue;
      }

      if (line.startsWith("```")) {
        const block: string[] = [];
        i += 1;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          block.push(lines[i]);
          i += 1;
        }
        i += 1;
        elements.push(
          <pre key={`code-${i}`} className="my-6 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
            {block.join("\n")}
          </pre>,
        );
        continue;
      }

      if (/^####\s+/.test(line)) {
        elements.push(
          <h4 key={`h4-${i}`} className="mt-6 text-base font-black text-slate-800 dark:text-slate-100">
            {line.replace(/^####\s+/, "")}
          </h4>,
        );
        i += 1;
        continue;
      }

      if (/^###\s+/.test(line)) {
        elements.push(
          <h3 key={`h3-${i}`} className="mt-7 text-lg font-black text-blue-700 dark:text-blue-300">
            {line.replace(/^###\s+/, "")}
          </h3>,
        );
        i += 1;
        continue;
      }

      if (/^##\s+/.test(line)) {
        elements.push(
          <h2 key={`h2-${i}`} className="mt-8 text-xl font-black text-slate-900 dark:text-slate-100">
            {line.replace(/^##\s+/, "")}
          </h2>,
        );
        i += 1;
        continue;
      }

      if (/^#\s+/.test(line)) {
        elements.push(
          <h1 key={`h1-${i}`} className="mt-8 text-2xl font-black text-slate-900 dark:text-slate-100">
            {line.replace(/^#\s+/, "")}
          </h1>,
        );
        i += 1;
        continue;
      }

      if (/^---+$/.test(line)) {
        elements.push(<hr key={`hr-${i}`} className="my-7 border-slate-200 dark:border-slate-700" />);
        i += 1;
        continue;
      }

      if (/^>\s+/.test(line)) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i += 1;
        }
        elements.push(
          <blockquote key={`quote-${i}`} className="my-6 rounded-r-2xl border-l-4 border-blue-500 bg-blue-50/70 p-4 text-slate-700 dark:border-blue-300 dark:bg-slate-800 dark:text-slate-200">
            {quoteLines.join("\n")}
          </blockquote>,
        );
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const ordered: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          ordered.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i += 1;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-5 list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-300">
            {ordered.map((item, idx) => (
              <li key={`ol-item-${i}-${idx}`} className="leading-7">
                {renderInlineText(item)}
              </li>
            ))}
          </ol>,
        );
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        const unordered: string[] = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          unordered.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i += 1;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-5 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
            {unordered.map((item, idx) => (
              <li key={`ul-item-${i}-${idx}`} className="leading-7">
                {renderInlineText(item)}
              </li>
            ))}
          </ul>,
        );
        continue;
      }

      if (/^\|.+\|$/.test(line)) {
        const tableLines: string[] = [];
        while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
          tableLines.push(lines[i]);
          i += 1;
        }
        elements.push(
          <pre key={`table-${i}`} className="my-6 overflow-x-auto rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {tableLines.join("\n")}
          </pre>,
        );
        continue;
      }

      const paragraphLines: string[] = [];
      while (i < lines.length && lines[i].trim() && !blockStartRegex.test(lines[i].trim())) {
        paragraphLines.push(lines[i].trim());
        i += 1;
      }

      if (paragraphLines.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="my-4 leading-8 text-slate-700 dark:text-slate-300">
            {renderInlineText(paragraphLines.join(" "))}
          </p>,
        );
      } else {
        i += 1;
      }
    }

    return elements;
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/ebook");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-36 sm:px-6 sm:pt-40 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={16} /> 이전으로
          </button>

          <button
            type="button"
            onClick={() => window.open(`/viewer/${testLectureId ?? 1}`, "_blank", "noopener,noreferrer")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FileText size={16} /> 테스트 전자책 PDF 보기
          </button>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <BookOpen size={14} /> WEB E-BOOK READER
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">코딩 몰라도 하루 만에 내 서비스 출시하기</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            업로드된 원고 전체를 챕터 탭으로 분리해 브라우저에서 바로 읽을 수 있습니다.
          </p>
        </div>

        <div className="mb-5 overflow-x-auto pb-2">
          <div className="inline-flex min-w-full gap-2">
            {tabs.map((chapter) => {
              const isActive = chapter.id === activeTab;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setActiveTab(chapter.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {chapter.title}
                </button>
              );
            })}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-3xl font-black tracking-tight">{activeChapter?.subtitle ?? "불러오는 중..."}</h2>
            <div className="mt-6">{activeChapter ? renderChapterContent(activeChapter.content) : "전자책 내용을 불러오는 중입니다..."}</div>
          </article>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <ListChecks size={14} /> CHAPTER CHECKLIST
            </div>
            {checklist.length > 0 ? (
              <ul className="space-y-3">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">이 챕터에는 체크리스트 항목이 없습니다.</p>
            )}
          </aside>
        </section>
      </main>

      {lightboxSrc && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="이미지 닫기"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxSrc}
            alt={lightboxAlt}
            className="max-h-[88vh] max-w-[94vw] rounded-2xl border border-white/20 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

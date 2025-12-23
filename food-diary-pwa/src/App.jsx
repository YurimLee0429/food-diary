import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import List from "./pages/List.jsx";
import Detail from "./pages/Detail.jsx";
import Editor from "./pages/Editor.jsx";
import ThemePicker from "./pages/ThemePicker.jsx";

const FONTS = {
  malgun:
    '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',

  gothic:
    '"Noto Sans KR","Apple SD Gothic Neo",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',

  roboto:
    'Roboto,"Noto Sans KR",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',

   courier:
    '"Courier New","SFMono-Regular","Menlo","Monaco","Noto Sans Mono",monospace',

  serif:
    'Georgia,"Times New Roman","Noto Serif KR",-apple-system,system-ui,serif',
};

const THEMES = {
  A: { background: "#E7F5FF", primary: "#74C0FC" },
  B: { background: "#f9d9e0ff", primary: "#F783AC" },
  C: { background: "#D3F9D8", primary: "#38D9A9" },
  D: { background: "#F3F0FF", primary: "#9476edff" },
  E: { background: "#fef7d5ff", primary: "#fcd970ff" },
  F: { background: "#f7e3c8ff", primary: "#FF922B" },
  G: { background: "#F8F0FC", primary: "#DA77F2" },
  H: { background: "#E6FCF5", primary: "#15AABF" },
  I: { background: "#FFF0F6", primary: "#F06595" },
  J: { background: "#F8F9FA", primary: "#868E96" },
  K: { background: "#FFFFFF", primary: "#000000" },
};

function applyTheme(fnt, clr, th) {
  const t = THEMES[th] || THEMES.K;
  document.documentElement.style.setProperty("--bg", t.background);
  document.documentElement.style.setProperty("--primary", t.primary);
  document.body.style.fontFamily = FONTS[fnt] || FONTS.malgun;
  document.body.style.color = clr;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const f = localStorage.getItem("APP_FONT") || "malgun";
    const c = localStorage.getItem("APP_COLOR") || "#000000";
    const t = localStorage.getItem("APP_THEME") || "K";
    applyTheme(f, c, t);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* ✅ 네비게이션 바 */}
      <nav
        className="w-full flex justify-center py-4 shadow-md fixed top-0 left-0 z-50"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {/* ✅ PC 메뉴 (가운데 정렬 그대로 유지) */}
        <div className="hidden md:flex gap-6 px-6 py-2 bg-white/90 rounded-lg shadow-md">
          <Link
            to="/"
            className="px-3 py-1 rounded-md font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
          >
            리스트
          </Link>
          <Link
            to="/new"
            className="px-3 py-1 rounded-md font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
          >
            새 다이어리
          </Link>
          <Link
            to="/themes"
            className="px-3 py-1 rounded-md font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
          >
            테마 선택
          </Link>
        </div>

        {/* ✅ 모바일 햄버거 메뉴 */}
        <div className="flex md:hidden justify-between items-center w-full px-4">
          <h1 className="text-white font-semibold text-lg">✨ My Diary</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
          >
            ☰
          </button>
        </div>

        {/* ✅ 모바일 드롭다운 메뉴 */}
        {menuOpen && (
          <div className="absolute top-full right-4 mt-2 w-40 bg-white rounded-lg shadow-lg flex flex-col border">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-t-md"
            >
              리스트
            </Link>
            <Link
              to="/new"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
            >
              새 다이어리
            </Link>
            <Link
              to="/themes"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-b-md"
            >
              테마 선택
            </Link>
          </div>
        )}
      </nav>

      {/* ✅ 페이지 라우팅 */}
      <div className="pt-20 p-4 sm:max-w-2xl sm:mx-auto">
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/new" element={<Editor />} />
          <Route path="/edit/:id" element={<Editor />} />
          <Route path="/themes" element={<ThemePicker />} />
        </Routes>
      </div>
    </div>
  );
}

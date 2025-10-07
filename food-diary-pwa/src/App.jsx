import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import List from "./pages/List.jsx";
import Detail from "./pages/Detail.jsx";
import Editor from "./pages/Editor.jsx";
import ThemePicker from "./pages/ThemePicker.jsx";

// 👉 테마/폰트 정의
const FONTS = {
  malgun: '"Malgun Gothic","맑은 고딕",sans-serif',
  roboto: "Roboto,system-ui,sans-serif",
  nanum: '"Nanum Pen Script",cursive',
  gothic: '"Noto Sans KR",sans-serif',
  serif: "Georgia,serif",
  comic: '"Comic Sans MS",cursive',
  courier: '"Courier New",monospace',
  futura: "Futura,sans-serif",
  garamond: "Garamond,serif",
  impact: "Impact,sans-serif",
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
  useEffect(() => {
    // 시작 시 테마 불러오기
    const f = localStorage.getItem("APP_FONT") || "malgun";
    const c = localStorage.getItem("APP_COLOR") || "#000000";
    const t = localStorage.getItem("APP_THEME") || "K";
    applyTheme(f, c, t);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* ✅ 네비게이션 바 */}
      <nav
        className="w-full flex justify-center py-4 shadow-md"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="flex gap-6 px-6 py-2 bg-white/90 rounded-lg shadow-md">
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
      </nav>

      {/* ✅ 페이지 라우팅 */}
      <div className="p-4 sm:max-w-2xl sm:mx-auto">
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/new" element={<Editor />} />
          {/* ✅ 수정용 경로 추가 */}
          <Route path="/edit/:id" element={<Editor />} />
          <Route path="/themes" element={<ThemePicker />} />
        </Routes>
      </div>
    </div>
  );
}

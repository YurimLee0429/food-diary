import { useEffect, useState } from "react";

/* =====================
   폰트
===================== */
const FONTS = {
  malgun:
    '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
  roboto:
    'Roboto,"Noto Sans KR",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
  nanum:
    '"Nanum Pen Script","Comic Neue","Patrick Hand",-apple-system,system-ui,cursive',
  gothic:
    '"Noto Sans KR","Apple SD Gothic Neo",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
  serif:
    'Georgia,"Times New Roman","Noto Serif KR",-apple-system,system-ui,serif',
  comic:
    '"Comic Sans MS","Comic Neue","Patrick Hand",-apple-system,system-ui,cursive',
  courier:
    '"Courier New","SFMono-Regular","Menlo","Monaco","Noto Sans Mono",monospace',
  futura:
    'Futura,"Avenir Next","Nunito",-apple-system,system-ui,sans-serif',
  garamond:
    '"Garamond","EB Garamond","Noto Serif KR","Times New Roman",serif',
  impact:
    '"Impact","Anton","Bebas Neue","Arial Black",-apple-system,system-ui,sans-serif',
};

/* =====================
   테마 (App.jsx 기준과 동일)
===================== */
const THEMES = {
  A: { name: "하늘", background: "#E7F5FF", primary: "#74C0FC" },
  B: { name: "핑크", background: "#f9d9e0ff", primary: "#F783AC" },
  C: { name: "민트", background: "#D3F9D8", primary: "#38D9A9" },
  D: { name: "퍼플", background: "#F3F0FF", primary: "#9476edff" },
  E: { name: "옐로우", background: "#fef7d5ff", primary: "#fcd970ff" },
  F: { name: "오렌지", background: "#f7e3c8ff", primary: "#FF922B" },
  G: { name: "라벤더", background: "#F8F0FC", primary: "#DA77F2" },
  H: { name: "민트블루", background: "#E6FCF5", primary: "#15AABF" },
  I: { name: "피치", background: "#FFF0F6", primary: "#F06595" },
  J: { name: "그레이", background: "#F8F9FA", primary: "#868E96" },
  K: { name: "블랙&화이트", background: "#FFFFFF", primary: "#000000" },
};

/* =====================
   테마 적용
===================== */
function applyTheme(fnt, th) {
  const t = THEMES[th] || THEMES.K;

  document.documentElement.style.setProperty("--bg", t.background);
  document.documentElement.style.setProperty("--primary", t.primary);
  document.body.style.fontFamily = FONTS[fnt] || FONTS.malgun;

  localStorage.setItem("APP_FONT", fnt);
  localStorage.setItem("APP_THEME", th);
}

export default function ThemePicker() {
  const [font, setFont] = useState("malgun");
  const [theme, setTheme] = useState("K");

  useEffect(() => {
    setFont(localStorage.getItem("APP_FONT") || "malgun");
    setTheme(localStorage.getItem("APP_THEME") || "K");
  }, []);

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          🎨 테마 & 폰트
        </h2>

        {/* 배경 테마 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">배경 테마</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(THEMES).map(([k, t]) => (
              <button
                key={k}
                onClick={() => {
                  setTheme(k);
                  applyTheme(font, k);
                }}
                className={`px-4 py-2 rounded-lg border shadow-sm transition-transform hover:scale-105 ${
                  theme === k ? "ring-2 ring-offset-2 ring-[var(--primary)]" : ""
                }`}
                style={{ background: t.background, color: t.primary }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 폰트 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">폰트</h3>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--primary)] bg-white shadow-sm"
            value={font}
            onChange={(e) => {
              setFont(e.target.value);
              applyTheme(e.target.value, theme);
            }}
          >
            {Object.entries(FONTS).map(([key, value]) => (
              <option key={key} value={key} style={{ fontFamily: value }}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

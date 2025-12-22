import { useEffect, useState } from "react";

// 폰트 10종
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

// 테마 (배경 + 메인 색상)
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

// 글자색 팔레트
const COLORS = [
  "#000000", "#1f2937", "#ef4444", "#f59e0b",
  "#10b981", "#0ea5e9", "#6366f1", "#db2777", "#334155"
];

// ✅ 공통 적용 함수
function applyTheme(fnt, clr, th) {
  const t = THEMES[th] || THEMES.K;
  document.documentElement.style.setProperty("--bg", t.background);
  document.documentElement.style.setProperty("--primary", t.primary);
  document.body.style.fontFamily = FONTS[fnt] || FONTS.malgun;
  document.body.style.color = clr;

  // 저장
  localStorage.setItem("APP_FONT", fnt);
  localStorage.setItem("APP_COLOR", clr);
  localStorage.setItem("APP_THEME", th);
}

export default function ThemePicker() {
  const [font, setFont] = useState("malgun");
  const [color, setColor] = useState("#000000");
  const [theme, setTheme] = useState("K");

  // ✅ 첫 로드 시 저장된 설정 불러오기
  useEffect(() => {
    const f = localStorage.getItem("APP_FONT") || "malgun";
    const c = localStorage.getItem("APP_COLOR") || "#000000";
    const t = localStorage.getItem("APP_THEME") || "K";
    setFont(f);
    setColor(c);
    setTheme(t);
    applyTheme(f, c, t);
  }, []);

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">🎨 테마 & 폰트</h2>

        {/* 배경 테마 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">배경 테마</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(THEMES).map(([k, t]) => (
              <button
                key={k}
                onClick={() => {
                  setTheme(k);
                  applyTheme(font, color, k);
                }}
                className={`px-4 py-2 rounded-lg border shadow-sm transition-transform hover:scale-105 ${
                  theme === k ? "ring-2 ring-offset-2 ring-blue-500" : ""
                }`}
                style={{ background: t.background, color: t.primary }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 폰트 선택 (미리보기 적용) */}
        <div>
          <h3 className="text-lg font-semibold mb-2">폰트</h3>
          <select
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 bg-white shadow-sm"
            value={font}
            onChange={(e) => {
              setFont(e.target.value);
              applyTheme(e.target.value, color, theme);
            }}
          >
            <option value="malgun" style={{ fontFamily: FONTS.malgun }}>
              Malgun Gothic (맑은 고딕)
            </option>
            <option value="roboto" style={{ fontFamily: FONTS.roboto }}>
              Roboto
            </option>
            <option value="nanum" style={{ fontFamily: FONTS.nanum }}>
              Nanum Pen Script
            </option>
            <option value="gothic" style={{ fontFamily: FONTS.gothic }}>
              Noto Sans KR (고딕)
            </option>
            <option value="serif" style={{ fontFamily: FONTS.serif }}>
              Georgia (세리프)
            </option>
            <option value="comic" style={{ fontFamily: FONTS.comic }}>
              Comic Sans
            </option>
            <option value="courier" style={{ fontFamily: FONTS.courier }}>
              Courier New (타자기체)
            </option>
            <option value="futura" style={{ fontFamily: FONTS.futura }}>
              Futura (Modern)
            </option>
            <option value="garamond" style={{ fontFamily: FONTS.garamond }}>
              Garamond (고전체)
            </option>
            <option value="impact" style={{ fontFamily: FONTS.impact }}>
              Impact (굵은 제목체)
            </option>
          </select>
        </div>

        {/* 글자색 */}
      
      </div>
    </div>
  );
}

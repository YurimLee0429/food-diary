import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uid, saveEntry, getEntry } from "../lib/db";
import { extractLatLng } from "../lib/exif";
import { reverseGeocode } from "../lib/geocode";
import StickerCanvas from "../components/StickerCanvas";
import PlaceSearch from "../components/PlaceSearch";

export default function Editor() {
  const nav = useNavigate();
  const { id } = useParams();
  const [memoOpen, setMemoOpen] = useState(false);

  // ✏️ 펜 관련 상태
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState("#000000");

  // 🚨 필수 입력 검증용 상태
  const [error, setError] = useState("");

  const COLORS = [
    "#000000", "#4B5563", "#6B7280",
    "#FF0000", "#FFA500", "#FFFF00",
    "#00FF00", "#00BFFF", "#0000FF",
    "#FF69B4", "#FF1493", "#FF7F50",
    "#9370DB", "#8A2BE2", "#BA55D3",
    "#7FFFD4", "#AEEEEE", "#E6E6FA"
  ];

  const empty = {
    id: uid(),
    name: "",
    address: "",
    memo: "",
    theme: localStorage.getItem("APP_THEME") || "K",
    bgColor: "var(--bg)",
    lineStyle: "solid",
    mainPhotoUrl: "",
    photoUrls: [],
    layers: [],
    coords: null,
    createdAt: Date.now(),
    drawing: "",
  };

  const [form, setForm] = useState(empty);

  // ✅ 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    (async () => {
      if (id) {
        const ex = await getEntry(id);
        if (ex) setForm(ex);
      }
    })();
  }, [id]);

  // ✅ 파일 → base64 변환
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 🚨 완료 버튼 클릭 시 필수값 검증 + 저장
  const handleComplete = async () => {
    if (!form.name.trim()) {
      setError("📍 장소(제목)을 입력해주세요!");
      return;
    }
    if (!form.mainPhotoUrl) {
      setError("📸 메인 사진을 등록해주세요!");
      return;
    }

    setError("");
    await saveEntry(form); // ✅ 이 시점에만 DB 저장
    nav(`/detail/${form.id}`);
  };

  return (
    <div
      className="w-full min-h-screen p-4 sm:max-w-2xl sm:mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* 🩷 상단 타이틀 */}
      <div className="text-center mb-8 mt-2">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{
            color: "var(--primary)",
            fontFamily: "inherit",
          }}
        >
          New Diary
        </h1>
        <p
          className="text-gray-600 text-sm sm:text-base"
          style={{ fontFamily: "inherit" }}
        >
          나만의 맛집 & 카페 & 핫플 기록 다이어리 ☕🍰💕
        </p>
      </div>

      {/* 상단 네비 */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => nav(-1)}
        >
          〈 뒤로
        </button>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={() => setMemoOpen(true)}
          >
            메모
          </button>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleComplete}
          >
            완료
          </button>
        </div>
      </div>

      {/* 🚨 에러 메시지 */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-3 rounded text-sm text-center">
          {error}
        </div>
      )}

      {/* ✅ 장소 검색 */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">
          장소 검색 <span className="text-red-500">*</span>
        </h3>
        <PlaceSearch
          defaultQuery={form.name}
          onSelect={(p) => {
            setForm((s) => ({
              ...s,
              name: p.name,
              address: p.address,
              coords: p.coords,
            }));
          }}
        />
        {form.address && (
          <p className="text-sm text-gray-600 mt-1">📍 {form.address}</p>
        )}
      </div>

      {/* ✅ 메인 사진 */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">
          메인 사진 <span className="text-red-500">*</span>
        </h3>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const base64 = await toBase64(file);
            setForm((s) => ({ ...s, mainPhotoUrl: base64 }));

            const gps = await extractLatLng(file);
            if (gps) {
              setForm((s) => ({ ...s, coords: gps }));
              const place = await reverseGeocode(gps);
              if (place?.region)
                setForm((s) => ({ ...s, address: place.region }));
            }
          }}
        />
        {form.mainPhotoUrl && (
          <img
            src={form.mainPhotoUrl}
            alt="미리보기"
            className="mt-2 rounded-lg shadow-sm border w-40"
          />
        )}
      </div>

      {/* ✅ 추가 사진 */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">추가 사진</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const urls = await Promise.all(files.map(toBase64));

            setForm((s) => ({
              ...s,
              photoUrls: [...s.photoUrls, ...urls],
              layers: [
                ...s.layers,
                ...urls.map((u, i) => ({
                  id: `p_${Date.now()}_${i}`,
                  type: "photo",
                  url: u,
                  x: 40 + 80 * i,
                  y: 40,
                  scale: 1,
                  rotation: 0,
                  shape: "rect",
                  width: 120,
                  height: 120,
                })),
              ],
            }));
          }}
        />
      </div>

      {/* ✅ 스티커 */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">스티커</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "🌸", "🌻", "🌼", "🌷", "🍀", "🎈", "🎉", "✨",
            "💕", "⭐", "☕", "🍰", "🍜", "🍣", "🍔", "🍕",
            "🍩", "🧋", "🍦", "🍧", "🥤", "🧁", "🍫", "🍟", "🌃", "🎶"
          ].map((e) => (
            <button
              key={e}
              className="px-3 py-2 rounded-full border hover:bg-gray-50 text-xl"
              onClick={() =>
                setForm((s) => ({
                  ...s,
                  layers: [
                    ...s.layers,
                    {
                      id: uid(),
                      type: "sticker",
                      emoji: e,
                      x: 60,
                      y: 60,
                      scale: 1,
                      rotation: 0,
                      width: 64,
                      height: 64,
                    },
                  ],
                }))
              }
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* ✏️ 펜 / 지우개 툴바 */}
      <div className="sticky top-2 bg-white/80 z-30 flex flex-wrap gap-2 p-2 rounded-md shadow mb-2">
        <button
          onClick={() => setIsDrawingMode((v) => !v)}
          className={`px-2 py-1 rounded-md text-sm ${
            isDrawingMode ? "bg-pink-500 text-white" : "bg-white text-gray-700"
          }`}
        >
          {isDrawingMode ? "🖊️ 펜모드 ON" : "펜모드 OFF"}
        </button>
        {isDrawingMode && (
          <>
            <button
              onClick={() => setIsEraser(false)}
              className={`px-2 py-1 rounded-md text-sm ${
                !isEraser ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              ✏️ 펜
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`px-2 py-1 rounded-md text-sm ${
                isEraser ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              🧽 지우개
            </button>
            <div className="flex gap-1 ml-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-5 h-5 rounded-full border ${
                    penColor === c && !isEraser ? "ring-2 ring-blue-400" : ""
                  }`}
                  style={{ background: c }}
                  onClick={() => {
                    setIsEraser(false);
                    setPenColor(c);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ✅ Sticker Canvas */}
      <StickerCanvas
        bgColor="var(--primary)"
        layers={form.layers}
        mainPhotoUrl={form.mainPhotoUrl}
        onChange={(lid, patch) =>
          setForm((s) => ({
            ...s,
            layers: s.layers.map((l) =>
              l.id === lid ? { ...l, ...patch } : l
            ),
          }))
        }
        onRemove={(lid) =>
          setForm((s) => ({
            ...s,
            layers: s.layers.filter((l) => l.id !== lid),
          }))
        }
        lineStyle={form.lineStyle}
        memo={form.memo}
        readOnly={false}
        isDrawingMode={isDrawingMode}
        isEraser={isEraser}
        penColor={penColor}
        existingDrawing={form.drawing}
        onDrawEnd={(dataUrl) =>
          setForm((s) => ({
            ...s,
            drawing: dataUrl,
          }))
        }
      />

      {/* ✅ 메모 모달 */}
      {memoOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow p-4 w-96">
            <h3 className="font-semibold mb-2">메모 작성</h3>
            <textarea
              className="w-full border rounded p-2 h-40"
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setMemoOpen(false)}
              >
                닫기
              </button>
              <button
                className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setMemoOpen(false)}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
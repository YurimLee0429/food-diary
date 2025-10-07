import { useEffect, useRef, useState } from "react";

export default function PlaceSearch({ onSelect, defaultQuery = "" }) {
  const [q, setQ] = useState(defaultQuery);
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // 로딩 표시
  const boxRef = useRef(null);

  // 디바운스 훅
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    if (!debouncedQ?.trim()) {
      setList([]);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`)
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`서버 오류: ${r.status}`);
        }
        return await r.json();
      })
      .then((data) => {
        if (!data.items) {
          setList([]);
          return;
        }
        setList(data.items);
      })
      .catch((err) => {
        console.error("검색 실패:", err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  // 바깥 클릭 닫기
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <input
        className="w-full border rounded px-3 py-2 bg-white/60 text-gray-800 placeholder:text-gray-400"
        placeholder="식당/장소 검색 (예: A갈비 홍대)"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-lg border bg-white shadow">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">검색 중...</div>
          )}

          {!loading && list.length === 0 && q.trim() && (
            <div className="px-3 py-2 text-sm text-gray-500">
              검색 결과 없음
            </div>
          )}

          {!loading &&
            list.map((it, idx) => (
              <button
                key={idx}
                className="w-full text-left px-3 py-2 hover:bg-[var(--bg)]"
                onClick={() => {
                  setQ(it.name);
                  setOpen(false);
                  onSelect?.(it);
                }}
              >
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {it.address}
                </div>
                {it.coords && (
                  <div className="text-xs text-green-600">
                    좌표: {it.coords.lat}, {it.coords.lng}
                  </div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// 🔹 작은 훅: 디바운스
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

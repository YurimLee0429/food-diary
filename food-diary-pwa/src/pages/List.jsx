import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadEntries, deleteEntry } from "../lib/db";

export default function List() {
  const nav = useNavigate();
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ 데이터 불러오기
  useEffect(() => {
    (async () => setEntries(await loadEntries()))();
  }, []);

  // ✅ 검색 필터
  const filtered = entries.filter((e) => {
    const q = query.toLowerCase();
    return (
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.memo && e.memo.toLowerCase().includes(q)) ||
      (e.address && e.address.toLowerCase().includes(q))
    );
  });

  // ✅ 페이지 계산
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  // ✅ 삭제
  async function handleDelete(id) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await deleteEntry(id);
    setEntries(await loadEntries());
  }

  // ✅ 주소 기반 네이버 지도 열기
  function openNaverMapByAddress(address) {
    if (!address) return alert("주소 정보가 없습니다 😢");
    const encoded = encodeURIComponent(address);
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (mobile) {
      const appUrl = `nmap://search?query=${encoded}&appname=com.example.myapp`;
      const fallback = `https://map.naver.com/v5/search/${encoded}`;
      window.location.href = appUrl;
      setTimeout(() => window.open(fallback, "_blank"), 700);
    } else {
      window.open(`https://map.naver.com/v5/search/${encoded}`, "_blank");
    }
  }

  return (
    <div
      className="w-full min-h-screen p-4 sm:max-w-2xl sm:mx-auto transition-colors"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* 💜 타이틀 영역 */}
      <div className="text-center mb-8 mt-2">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2 tracking-wide"
          style={{
            color: "var(--primary)",
            fontFamily: "inherit",
          }}
        >
          My List
        </h1>
        <p
          className="text-gray-600 text-sm sm:text-base"
          style={{ fontFamily: "inherit" }}
        >
          나만의 맛집 & 카페 & 핫플 기록 다이어리 ☕🍰💕
        </p>
        <div
          className="flex justify-center items-center gap-3 mt-2"
        ><span
          className="w-10 h-[2px] rounded transition-colors"
          style={{ backgroundColor: "var(--primary)" }}
        ></span>
          <span
            className="transition-colors"
            style={{ color: "var(--primary)" }}
          >
            🌷
          </span>
          <span
            className="w-10 h-[2px] rounded transition-colors"
            style={{ backgroundColor: "var(--primary)" }}
          ></span></div>

      </div>

      {/* 🔍 검색 + 작성 버튼 */}
      <div className="flex items-center gap-2 mb-6 sticky top-0 bg-[var(--bg)] z-10 pb-3">
        <input
          className="flex-1 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
          placeholder="검색 (이름, 주소, 메모 내용)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button
          className="px-4 py-2 rounded-full text-white font-semibold shadow-md transition-all duration-200"
          style={{
            backgroundColor: "var(--primary)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
          }}
          onClick={() => nav("/new")}
          onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "color-mix(in srgb, var(--primary) 85%, white 15%)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--primary)")
          }
        >
          ＋ 작성
        </button>
      </div>

      {/* 📘 카드 목록 */}
      {currentItems.length === 0 && (
        <div className="text-center mt-16 text-gray-500">
          <div
            className="text-5xl mb-3"
            style={{ color: "var(--primary)" }}
          >
            📔
          </div>
          <p className="text-gray-700">등록된 다이어리가 없습니다.</p>
          <p className="text-sm mt-1 text-gray-400">
            오른쪽 상단의 ＋ 작성 버튼을 눌러 나만의 핫플을 기록해보세요!
          </p>
        </div>
      )}

      {currentItems.map((e) => (
        <div
          key={e.id}
          className="bg-[color-mix(in_srgb,var(--bg)_85%,var(--primary)_15%)]
                     border rounded-lg sm:rounded-xl shadow-sm p-4 mb-6 w-full 
                     transition-transform duration-200 hover:scale-[1.01]"
        >
          {/* 📷 메인 이미지 */}
          <div className="relative w-full aspect-video mb-3 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
            {e.mainPhotoUrl && e.mainPhotoUrl.startsWith("data:image") ? (
              <img
                src={e.mainPhotoUrl}
                alt="메인사진"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <span className="text-gray-400 text-sm">사진 없음</span>
            )}
          </div>

          {/* 🏷 제목 + 주소 */}
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="text-base sm:text-lg font-semibold cursor-pointer hover:underline text-[var(--primary)]"
                onClick={() => nav(`/detail/${e.id}`)}
              >
                {e.name || "제목 없음"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {e.address || "주소 없음"}
              </p>
              <small className="text-[10px] sm:text-xs text-gray-400">
                {new Date(e.createdAt).toLocaleDateString()}{" "}
                {new Date(e.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>

            {/* 🎛 오른쪽 버튼 그룹 */}
            <div className="flex flex-col gap-1 text-sm text-right items-end">
              <button
                className="px-2 py-1 text-gray-600 hover:underline"
                onClick={() => nav(`/edit/${e.id}`)}
              >
                ✏ 수정
              </button>
              <button
                className="px-2 py-1 text-red-500 hover:underline"
                onClick={() => handleDelete(e.id)}
              >
                🗑 삭제
              </button>
              {e.address && (
                <button
                  className="px-2 py-1 text-[var(--primary)] hover:underline"
                  onClick={() => openNaverMapByAddress(e.address)}
                >
                  📍 지도
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ⏩ 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`px-3 py-1 text-sm border rounded-md ${n === currentPage ? "text-white" : "bg-white hover:bg-gray-100"
                }`}
              style={{
                backgroundColor:
                  n === currentPage ? "var(--primary)" : "transparent",
              }}
              onClick={() => setCurrentPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

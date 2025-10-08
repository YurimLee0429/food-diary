import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEntry } from "../lib/db";
import StickerCanvas from "../components/StickerCanvas";

export default function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showMemo, setShowMemo] = useState(false); // 💬 메모 팝업

  useEffect(() => {
    (async () => setItem(await getEntry(id)))();
  }, [id]);

  if (!item) return <p className="text-center text-gray-500">불러오는 중...</p>;

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
      className="w-full min-h-screen p-4 sm:max-w-2xl sm:mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* 상단 네비 */}
      <div className="sticky top-0 z-10 bg-[var(--bg)] flex justify-between items-center pb-2 mb-4">
        <button
          className="px-3 py-1 text-gray-600 hover:underline"
          onClick={() => nav("/")}
        >
          〈 목록 보기
        </button>
        <button
          className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => nav(`/edit/${item.id}`)}
        >
          수정
        </button>
      </div>

      {/* 제목 + 주소 */}
      <h2 className="text-lg sm:text-xl font-semibold mb-1">
        {item.name || "제목 없음"}
      </h2>
      <p className="text-sm text-gray-600 mb-1">
        {item.address || "주소 정보 없음"}
      </p>

      {/* 버튼 묶음 */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => openNaverMapByAddress(item.address)}
          className="px-3 py-1 border rounded-md bg-white/80 hover:bg-pink-100 
                     text-pink-600 hover:text-pink-700 transition-all flex items-center gap-1 shadow-sm"
        >
          📍 지도 보기
        </button>

        {item.mainPhotoUrl && (
          <button
            onClick={() => setShowPhoto(true)}
            className="px-3 py-1 border rounded-md bg-white/80 hover:bg-blue-100 
                       text-blue-600 hover:text-blue-700 shadow-sm"
          >
            📸 메인 사진 크게 보기
          </button>
        )}

        {item.memo && (
          <button
            onClick={() => setShowMemo(true)}
            className="px-3 py-1 border rounded-md bg-white/80 hover:bg-green-100 
                       text-green-600 hover:text-green-700 shadow-sm"
          >
            💬 메모만 보기
          </button>
        )}
      </div>

      {/* 다이어리 */}
      <h3 className="font-semibold mt-6 mb-2">다이어리</h3>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <StickerCanvas
          bgColor={item.bgColor}
          layers={item.layers}
          mainPhotoUrl={item.mainPhotoUrl}
          lineStyle={item.lineStyle}
          memo={item.memo}
          readOnly={true}
        />
      </div>

      {/* 📸 사진 팝업 */}
      {showPhoto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={item.mainPhotoUrl}
              alt="확대된 사진"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
            />
            <button
              onClick={() => setShowPhoto(false)}
              className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-black shadow"
            >
              ✕ 닫기
            </button>
          </div>
        </div>
      )}

      {/* 💬 메모 팝업 */}
      {showMemo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-80 sm:w-96">
            <h3 className="text-lg font-semibold mb-3 text-center">📝 메모 보기</h3>
            <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
              {item.memo}
            </p>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowMemo(false)}
                className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

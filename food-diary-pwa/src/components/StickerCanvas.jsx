import { useEffect, useRef, useState } from "react";
import interact from "interactjs";

export default function StickerCanvas({
  bgColor,
  layers,
  onChange,
  onRemove,
  lineStyle,
  mainPhotoUrl,
  memo,
  readOnly = false,
  onDrawEnd,
  existingDrawing,
  isDrawingMode = false,
  isEraser = false,
  penColor = "#000000",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isDrawing, setIsDrawing] = useState(false);

  // ✅ 반응형 크기 조정
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Interact.js 설정 (스티커 이동 / 회전 / 리사이즈)
  useEffect(() => {
    if (!containerRef.current || readOnly) return;

    interact("[data-layer]", { context: containerRef.current })
      .draggable({
        listeners: {
          move(event) {
            if (isDrawingMode) return; // 🎨 펜모드일 때 드래그 비활성화
            const t = event.target;
            const id = t.dataset.layer;
            const x = (parseFloat(t.dataset.x) || 0) + event.dx;
            const y = (parseFloat(t.dataset.y) || 0) + event.dy;
            t.dataset.x = x;
            t.dataset.y = y;
            onChange(id, { x, y });
          },
        },
      })
      .gesturable({
        listeners: {
          move(event) {
            if (isDrawingMode) return;
            const t = event.target;
            const id = t.dataset.layer;
            const scale =
              (parseFloat(t.dataset.scale) || 1) * (1 + event.ds);
            const rotation =
              (parseFloat(t.dataset.rot) || 0) + event.da;
            t.dataset.scale = scale;
            t.dataset.rot = rotation;
            onChange(id, { scale, rotation });
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            if (isDrawingMode) return;
            const t = event.target;
            const id = t.dataset.layer;
            let { width, height } = event.rect;
            width = Math.max(40, Math.min(width, 400));
            height = Math.max(40, Math.min(height, 400));
            t.style.width = width + "px";
            t.style.height = height + "px";
            onChange(id, { width, height });
          },
        },
      });
  }, [onChange, readOnly, isDrawingMode]);

  // ✅ 드로잉 초기화 및 기존 그림 로드
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;

    // 이전 그림 불러오기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (existingDrawing) {
      const img = new Image();
      img.src = existingDrawing;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
  }, [existingDrawing]);

  // ✅ 좌표 계산
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  };

  // ✅ 그리기 시작
  const startDraw = (e) => {
    if (!isDrawingMode || readOnly) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = isEraser
      ? "destination-out"
      : "source-over";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = isEraser ? 20 : 3;
    ctx.beginPath();
    const { x, y } = getPos(e);
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  // ✅ 그리는 중
  const draw = (e) => {
    if (!isDrawing || !isDrawingMode || readOnly) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // ✅ 그리기 끝
  const endDraw = () => {
    if (!isDrawingMode) return;
    setIsDrawing(false);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    if (onDrawEnd) onDrawEnd(dataUrl);
  };

  // ✅ 선 스타일
  const border =
    lineStyle === "dotted"
      ? "1.5px dotted #94a3b8"
      : lineStyle === "dashed"
      ? "2px dashed #94a3b8"
      : lineStyle === "bold"
      ? "3px solid #94a3b8"
      : lineStyle === "light"
      ? "0.5px solid #94a3b8"
      : "1.5px solid #94a3b8";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[640px] border rounded-lg shadow-inner overflow-hidden"
      style={{
        background: `color-mix(in srgb, var(--bg) 90%, var(--primary) 10%)`,
        border,
        margin: "0 auto",
      }}
    >
      {/* ✏️ 드로잉 캔버스 */}
      <canvas
        ref={canvasRef}
        width={640}
        height={670}
        className={`absolute inset-0 z-10 transition-all ${
          isDrawingMode ? "cursor-crosshair" : "pointer-events-none"
        }`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      {/* ✅ 메인 사진 */}
      {mainPhotoUrl && (
        <div
          style={{
            position: "absolute",
            top: 110,
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.min(size.width * 0.25, 200),
            height: (Math.min(size.width * 0.25, 200) * 3) / 4,
            backgroundImage: `url(${mainPhotoUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,.25)",
            border: "2px solid rgba(255,255,255,0.8)",
          }}
        />
      )}

      {/* ✅ 메모 박스 */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bg-white/90 rounded-lg shadow-md flex items-center justify-center"
        style={{
          top: "45%",
          width: "50%",
          minHeight: 160,
          border,
          padding: 16,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {memo ||
          "메모 버튼을 클릭하여 내용을 입력하시면 여기에 메모가 표시됩니다"}
      </div>

      {/* ✅ 스티커 & 이미지 */}
      <div className="absolute inset-0">
        {layers.map((l) => (
          <div
            key={l.id}
            data-layer={l.id}
            data-x={l.x || 0}
            data-y={l.y || 0}
            data-rot={l.rotation || 0}
            data-scale={l.scale || 1}
            style={{
              position: "absolute",
              transform: `translate(${l.x || 0}px,${l.y || 0}px) rotate(${
                l.rotation || 0
              }deg) scale(${l.scale || 1})`,
              width: l.width || 120,
              height: l.height || 120,
              cursor: readOnly ? "default" : "move",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: l.type === "photo" ? `url(${l.url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                clipPath:
                  l.shape === "circle"
                    ? "circle(50%)"
                    : l.shape === "triangle"
                    ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                    : l.shape === "round"
                    ? "inset(0 round 20px)"
                    : l.shape === "star"
                    ? `polygon(
                        50% 0%,
                        61% 35%,
                        98% 35%,
                        68% 57%,
                        79% 91%,
                        50% 70%,
                        21% 91%,
                        32% 57%,
                        2% 35%,
                        39% 35%
                      )`
                    : "none",
              }}
              onClick={() => {
                if (!readOnly && l.type === "photo" && !isDrawingMode) {
                  const order = ["rect", "round", "circle", "triangle", "star"];
                  const next =
                    order[(order.indexOf(l.shape || "rect") + 1) % order.length];
                  onChange(l.id, { shape: next });
                }
              }}
            >
              {l.type === "sticker" ? l.emoji : null}
            </div>

            {!readOnly && (
              <button
                className="absolute -top-6 -right-2 text-red-500 text-sm bg-white rounded-full shadow px-1"
                onClick={() => onRemove(l.id)}
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

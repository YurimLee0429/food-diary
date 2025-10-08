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
  const [size, setSize] = useState({ width: window.innerWidth });

  const [isDrawing, setIsDrawing] = useState(false);

  // ✅ 강제 라이트모드 유지
  useEffect(() => {
    document.documentElement.style.colorScheme = "light";
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "color-scheme";
      document.head.appendChild(meta);
    }
    meta.content = "light";
  }, []);

  // ✅ 반응형 크기
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 스티커 이동 / 회전 / 리사이즈
  useEffect(() => {
    if (!containerRef.current || readOnly) return;
    interact("[data-layer]", { context: containerRef.current })
      .draggable({
        listeners: {
          move(event) {
            if (isDrawingMode) return;
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
            const scale = (parseFloat(t.dataset.scale) || 1) * (1 + event.ds);
            const rotation = (parseFloat(t.dataset.rot) || 0) + event.da;
            t.dataset.scale = scale;
            t.dataset.rot = rotation;
            onChange(id, { scale, rotation });
          },
        },
      });
  }, [onChange, readOnly, isDrawingMode]);

  // ✅ 기존 그림 불러오기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (existingDrawing) {
      const img = new Image();
      img.src = existingDrawing;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
  }, [existingDrawing]);

  // ✅ 드로잉 기능
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  };

  const startDraw = (e) => {
    if (!isDrawingMode || readOnly) return;
    e.preventDefault();
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

  const draw = (e) => {
    if (!isDrawing || !isDrawingMode || readOnly) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

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
      : "1.5px solid #94a3b8";

  const isMobile = size.width < 768;

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg shadow-inner overflow-hidden"
      style={{
        background: `color-mix(in srgb, var(--bg) 90%, var(--primary) 10%)`,
        border,
        width: "100%",
        aspectRatio: isMobile ? "3/4" : "1/1", // ✅ PC 정사각, 모바일 세로형
        maxHeight: isMobile ? "auto" : "640px",
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* ✏️ 드로잉 캔버스 */}
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        className={`absolute inset-0 z-10 ${
          isDrawingMode ? "cursor-crosshair" : "pointer-events-none"
        }`}
        style={{
          width: "100%",
          height: "100%",
        }}
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
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? "40%" : "30%",
            aspectRatio: "4/3",
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
        className="absolute left-1/2 transform -translate-x-1/2 bg-white/90 rounded-lg shadow-md flex items-center justify-center text-center"
        style={{
          top: "55%",
          width: isMobile ? "80%" : "50%",
          minHeight: isMobile ? "22vh" : "140px",
          padding: 16,
          border,
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {memo ||
          "메모 버튼을 클릭하여 내용을 입력하시면 여기에 메모가 표시됩니다"}
      </div>

      {/* ✅ 스티커 & 사진 */}
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

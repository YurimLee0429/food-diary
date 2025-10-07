import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 네이버 장소 검색 API 프록시
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ items: [] });

  try {
    // 1️⃣ 네이버 검색 API (지역/장소)
    const r = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(q)}&display=8`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_DEV_CLIENT_ID,
          "X-Naver-Client-Secret": process.env.NAVER_DEV_CLIENT_SECRET,
        },
      }
    );
    const data = await r.json();

    // 2️⃣ 각 결과를 좌표로 변환 (Geocoding API)
    const items = await Promise.all(
      (data.items || []).map(async (p, idx) => {
        const name = p.title.replace(/<\/?b>/g, "");
        const address = p.roadAddress || p.address;
        let coords = null;

        if (address) {
          try {
            const g = await fetch(
              `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`,
              {
                headers: {
                  "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLIENT_ID,
                  "X-NCP-APIGW-API-KEY": process.env.NAVER_CLIENT_SECRET,
                },
              }
            );
            const gdata = await g.json();
            if (gdata.addresses?.length > 0) {
              coords = {
                lat: parseFloat(gdata.addresses[0].y),
                lng: parseFloat(gdata.addresses[0].x),
              };
            }
          } catch (err) {
            console.error("Geocoding 실패:", err);
          }
        }

        return { id: idx, name, address, coords };
      })
    );

    res.json({ items });
  } catch (e) {
    console.error("검색 API 실패:", e);
    res.status(500).json({ error: "API 실패" });
  }
});

// ✅ 프로덕션 모드: Vite 프론트엔드 제공
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendPath = path.join(__dirname, "../dist");

  // 정적 파일 제공
  app.use(express.static(frontendPath));

  // 🩷 핵심 수정: path-to-regexp 오류 해결 ("/*" → "*")
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ✅ Render, Vercel 등은 PORT 환경변수 사용
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

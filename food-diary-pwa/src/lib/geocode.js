// 간단한 예시: 구글 Geocoding API를 사용해 좌표→주소 변환
// 실제 사용 시 YOUR_GOOGLE_KEY를 .env 등에 넣고 불러오세요.
// 없으면 null을 반환하여 "지역 없음"으로 남깁니다.

const GOOGLE_KEY = import.meta?.env?.VITE_GOOGLE_KEY || "";

export async function reverseGeocode({ lat, lng }) {
  if (!GOOGLE_KEY) return null;
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ko&key=${GOOGLE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data?.results?.[0]?.formatted_address;
    if (!addr) return null;
    // addr 예시: "대한민국 서울특별시 강남구 ..."
    // country 간단 추출
    const country = addr.includes("대한민국") ? "대한민국" : "";
    return { region: addr, country };
  } catch {
    return null;
  }
}

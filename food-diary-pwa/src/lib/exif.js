import exifr from "exifr";

// file(Input)에서 lat/lng 추출 (없으면 null)
export async function extractLatLng(file) {
  try {
    const gps = await exifr.gps(file);
    if (!gps) return null;
    return { lat: gps.latitude, lng: gps.longitude };
  } catch {
    return null;
  }
}

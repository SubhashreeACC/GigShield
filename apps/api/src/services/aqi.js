// Phase 5 Task 32: AQI API client
// Fetches current AQI by lat/lng with Redis caching (10-min TTL)
import { cacheGet, cacheSet } from "../lib/redis.js";

const AQI_API_KEY = process.env.AQI_API_KEY || "demo_key";
const AQI_BASE_URL = "https://api.waqi.info";
const CACHE_TTL = 600; // 10 minutes

/**
 * Fetch current AQI for given coordinates
 * @returns {Promise<{ aqi: number, level: string, dominantPollutant: string, raw: object }>}
 */
export async function getAQI(lat, lng) {
  const cacheKey = `aqi:${lat.toFixed(2)}:${lng.toFixed(2)}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const url = `${AQI_BASE_URL}/feed/geo:${lat};${lng}/?token=${AQI_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      return getMockAQI(lat, lng);
    }

    const data = await res.json();
    if (data.status !== "ok") {
      return getMockAQI(lat, lng);
    }

    const result = {
      aqi: data.data?.aqi || 0,
      level: getAQILevel(data.data?.aqi || 0),
      dominantPollutant: data.data?.dominentpol || "pm25",
      station: data.data?.city?.name || "Unknown",
      raw: data.data,
    };

    await cacheSet(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.warn("AQI API unavailable, using mock:", err.message);
    return getMockAQI(lat, lng);
  }
}

/**
 * Fetch AQI by city name
 */
export async function getAQIByCity(city) {
  const cacheKey = `aqi:city:${city.toLowerCase()}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const url = `${AQI_BASE_URL}/feed/${city}/?token=${AQI_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) return getMockAQIByCity(city);

    const data = await res.json();
    if (data.status !== "ok") return getMockAQIByCity(city);

    const result = {
      aqi: data.data?.aqi || 0,
      level: getAQILevel(data.data?.aqi || 0),
      dominantPollutant: data.data?.dominentpol || "pm25",
      station: data.data?.city?.name || city,
      raw: data.data,
    };

    await cacheSet(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.warn("AQI city API unavailable:", err.message);
    return getMockAQIByCity(city);
  }
}

function getAQILevel(aqi) {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy_sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very_unhealthy";
  return "hazardous";
}

function getMockAQI(lat, lng) {
  return {
    aqi: 150 + Math.floor(Math.random() * 200),
    level: "unhealthy",
    dominantPollutant: "pm25",
    station: "Mock Station",
    raw: { mock: true, lat, lng },
  };
}

function getMockAQIByCity(city) {
  const cityAQI = {
    mumbai: 120,
    delhi: 380,
    bangalore: 90,
    chennai: 110,
    hyderabad: 140,
  };
  const baseAQI = cityAQI[city.toLowerCase()] || 150;
  const aqi = baseAQI + Math.floor(Math.random() * 60 - 30);
  return {
    aqi,
    level: getAQILevel(aqi),
    dominantPollutant: "pm25",
    station: `${city} Monitor`,
    raw: { mock: true, city },
  };
}

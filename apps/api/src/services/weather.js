// Phase 5 Task 31: OpenWeather API client
// Fetches current weather by lat/lng with Redis caching (5-min TTL)
import { cacheGet, cacheSet } from "../lib/redis.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "demo_key";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const CACHE_TTL = 300; // 5 minutes

/**
 * Fetch current weather for given coordinates
 * @returns {Promise<{ temp: number, feelsLike: number, humidity: number, rainfall: number, windSpeed: number, description: string, icon: string, raw: object }>}
 */
export async function getWeather(lat, lng) {
  const cacheKey = `weather:${lat.toFixed(2)}:${lng.toFixed(2)}`;

  // Check cache first
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`OpenWeather API error: ${res.status}`);
      return getMockWeather(lat, lng);
    }

    const data = await res.json();
    const result = {
      temp: data.main?.temp || 0,
      feelsLike: data.main?.feels_like || 0,
      humidity: data.main?.humidity || 0,
      rainfall: data.rain?.["1h"] || data.rain?.["3h"] || 0,
      windSpeed: data.wind?.speed || 0,
      description: data.weather?.[0]?.description || "unknown",
      icon: data.weather?.[0]?.icon || "01d",
      raw: data,
    };

    await cacheSet(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.warn("OpenWeather API unavailable, using mock:", err.message);
    return getMockWeather(lat, lng);
  }
}

/**
 * Fetch weather by city name
 */
export async function getWeatherByCity(city) {
  const cacheKey = `weather:city:${city.toLowerCase()}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?q=${city},IN&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      return getMockWeatherByCity(city);
    }

    const data = await res.json();
    const result = {
      city: data.name,
      temp: data.main?.temp || 0,
      feelsLike: data.main?.feels_like || 0,
      humidity: data.main?.humidity || 0,
      rainfall: data.rain?.["1h"] || data.rain?.["3h"] || 0,
      windSpeed: data.wind?.speed || 0,
      description: data.weather?.[0]?.description || "unknown",
      icon: data.weather?.[0]?.icon || "01d",
      raw: data,
    };

    await cacheSet(cacheKey, result, CACHE_TTL);
    return result;
  } catch (err) {
    console.warn("OpenWeather city API unavailable:", err.message);
    return getMockWeatherByCity(city);
  }
}

// Mock fallback for development
function getMockWeather(lat, lng) {
  return {
    temp: 35 + Math.random() * 10,
    feelsLike: 38 + Math.random() * 8,
    humidity: 60 + Math.random() * 30,
    rainfall: Math.random() > 0.7 ? Math.random() * 20 : 0,
    windSpeed: 5 + Math.random() * 15,
    description: "partly cloudy",
    icon: "02d",
    raw: { mock: true, lat, lng },
  };
}

function getMockWeatherByCity(city) {
  const cityData = {
    mumbai: { temp: 32, rainfall: 15, humidity: 85 },
    delhi: { temp: 44, rainfall: 0, humidity: 30 },
    bangalore: { temp: 28, rainfall: 5, humidity: 65 },
    chennai: { temp: 36, rainfall: 2, humidity: 75 },
    hyderabad: { temp: 38, rainfall: 0, humidity: 45 },
  };
  const d = cityData[city.toLowerCase()] || { temp: 33, rainfall: 3, humidity: 60 };
  return {
    city,
    temp: d.temp + (Math.random() * 4 - 2),
    feelsLike: d.temp + 3,
    humidity: d.humidity,
    rainfall: d.rainfall * (0.5 + Math.random()),
    windSpeed: 8 + Math.random() * 10,
    description: d.rainfall > 5 ? "heavy rain" : "clear sky",
    icon: d.rainfall > 5 ? "10d" : "01d",
    raw: { mock: true, city },
  };
}

// Phase 5 Tasks 35, 36: Weather & trigger status API routes
import { getWeatherByCity } from "../services/weather.js";
import { getAQIByCity } from "../services/aqi.js";
import { getTrafficStatus } from "../services/traffic.js";
import { authMiddleware } from "../middleware/auth.js";
import { THRESHOLDS } from "../config/thresholds.js";

export async function weatherRoutes(app) {
  // Task 35: GET /api/weather/:city — weather data for a city
  app.get("/weather/:city", async (request, reply) => {
    const { city } = request.params;
    const weather = await getWeatherByCity(city);
    const aqi = await getAQIByCity(city);

    return reply.send({
      data: {
        weather,
        aqi,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Task 36: GET /api/triggers/status — current trigger status for user's zone
  app.get("/triggers/status", { preHandler: [authMiddleware] }, async (request, reply) => {
    const user = request.user;

    if (!user.city || !user.zone) {
      return reply.status(400).send({
        error: "ValidationError",
        message: "User location not set. Complete onboarding first.",
        statusCode: 400,
      });
    }

    const weather = await getWeatherByCity(user.city);
    const aqi = await getAQIByCity(user.city);
    const traffic = await getTrafficStatus(user.city, user.zone);

    const cityThresholds = THRESHOLDS[user.city.toLowerCase()] || THRESHOLDS.default;
    const breachedTriggers = [];

    // Check temperature threshold
    if (weather.temp > cityThresholds.temperature) {
      breachedTriggers.push({
        type: "heat",
        severity: weather.temp > cityThresholds.temperature + 5 ? "critical" : "high",
        message: `🌡️ Extreme heat: ${weather.temp.toFixed(1)}°C (threshold: ${cityThresholds.temperature}°C)`,
        value: weather.temp,
        threshold: cityThresholds.temperature,
      });
    }

    // Check rainfall threshold
    if (weather.rainfall > cityThresholds.rainfall) {
      breachedTriggers.push({
        type: "rain",
        severity: weather.rainfall > cityThresholds.rainfall * 2 ? "critical" : "high",
        message: `🌧️ Heavy rainfall: ${weather.rainfall.toFixed(1)} mm/hr (threshold: ${cityThresholds.rainfall} mm/hr)`,
        value: weather.rainfall,
        threshold: cityThresholds.rainfall,
      });
    }

    // Check AQI threshold
    if (aqi.aqi > cityThresholds.aqi) {
      breachedTriggers.push({
        type: "aqi",
        severity: aqi.aqi > 400 ? "critical" : "high",
        message: `💨 Hazardous air quality: AQI ${aqi.aqi} (threshold: ${cityThresholds.aqi})`,
        value: aqi.aqi,
        threshold: cityThresholds.aqi,
      });
    }

    // Check traffic disruption
    if (traffic.disrupted) {
      breachedTriggers.push({
        type: "traffic",
        severity: traffic.severity,
        message: `🚧 Traffic disruption: ${traffic.reason}`,
        value: traffic.severity,
        threshold: "disrupted",
      });
    }

    return reply.send({
      data: {
        city: user.city,
        zone: user.zone,
        isTriggered: breachedTriggers.length > 0,
        triggers: breachedTriggers,
        weather: {
          temp: weather.temp,
          rainfall: weather.rainfall,
          humidity: weather.humidity,
          description: weather.description,
        },
        aqi: {
          value: aqi.aqi,
          level: aqi.level,
        },
        traffic: {
          disrupted: traffic.disrupted,
          severity: traffic.severity,
        },
        timestamp: new Date().toISOString(),
      },
    });
  });
}

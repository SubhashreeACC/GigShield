// Phase 5 Task 33: Mock traffic API client
// Returns simulated traffic shutdown zones
// Configurable via environment to toggle mock/real

const USE_REAL_TRAFFIC = process.env.TRAFFIC_API_REAL === "true";

/**
 * Get traffic disruption status for a zone
 * @returns {Promise<{ disrupted: boolean, severity: string, zones: string[], reason: string, timestamp: string }>}
 */
export async function getTrafficStatus(city, zone) {
  if (USE_REAL_TRAFFIC) {
    // TODO: Integrate real traffic API (Google Maps, TomTom, etc.)
    return getMockTraffic(city, zone);
  }
  return getMockTraffic(city, zone);
}

function getMockTraffic(city, zone) {
  // Simulate traffic disruptions with realistic patterns
  const random = Math.random();
  const cityPatterns = {
    mumbai: { disruptionChance: 0.3, zones: ["Andheri", "Bandra", "Dadar"] },
    delhi: { disruptionChance: 0.25, zones: ["Connaught Place", "Karol Bagh", "Dwarka"] },
    bangalore: { disruptionChance: 0.35, zones: ["Koramangala", "HSR Layout", "Whitefield"] },
    chennai: { disruptionChance: 0.2, zones: ["T Nagar", "Anna Nagar", "Adyar"] },
    hyderabad: { disruptionChance: 0.2, zones: ["Madhapur", "Gachibowli", "Banjara Hills"] },
  };

  const pattern = cityPatterns[city.toLowerCase()] || { disruptionChance: 0.15, zones: [zone] };
  const disrupted = random < pattern.disruptionChance;

  return {
    disrupted,
    severity: disrupted ? (random < 0.1 ? "critical" : random < 0.2 ? "high" : "medium") : "none",
    zones: disrupted ? pattern.zones.slice(0, Math.ceil(Math.random() * 3)) : [],
    reason: disrupted ? "Road closure due to construction / VIP movement" : "Normal traffic flow",
    timestamp: new Date().toISOString(),
  };
}

// Phase 6 Task 37: Trigger threshold configuration
// Configurable per city, with sensible defaults

export const THRESHOLDS = {
  // Default thresholds
  default: {
    temperature: 42,  // °C — extreme heat
    rainfall: 10,     // mm/hr — heavy rain
    aqi: 300,         // AQI index — hazardous
  },

  // City-specific overrides
  mumbai: {
    temperature: 40,   // Lower heat threshold — coastal humidity makes heat worse
    rainfall: 8,       // Lower rainfall threshold — flood-prone city
    aqi: 300,
  },

  delhi: {
    temperature: 44,   // Higher threshold — drier heat
    rainfall: 15,      // Higher — better drainage in some areas
    aqi: 250,          // Lower AQI threshold — chronic pollution problem
  },

  bangalore: {
    temperature: 38,   // Lower — not used to extreme heat
    rainfall: 12,
    aqi: 300,
  },

  chennai: {
    temperature: 42,
    rainfall: 10,      // Cyclone-prone
    aqi: 300,
  },

  hyderabad: {
    temperature: 43,
    rainfall: 12,
    aqi: 300,
  },
};

/**
 * Get thresholds for a specific city
 */
export function getThresholds(city) {
  return THRESHOLDS[city.toLowerCase()] || THRESHOLDS.default;
}

// Phase 5 Task 34: Mock delivery platform client
// Returns simulated delivery logs for a user
// Used for activity verification in fraud detection

/**
 * Get delivery activity logs for a user
 * @returns {Promise<{ active: boolean, trips: number, hoursActive: number, zonesCovered: string[], lastActivity: string }>}
 */
export async function getDeliveryActivity(userId, city, zone) {
  // MVP: Always mock. Real integration would call Swiggy/Zomato partner APIs
  return getMockDeliveryActivity(userId, city, zone);
}

function getMockDeliveryActivity(userId, city, zone) {
  const random = Math.random();
  const isActive = random > 0.15; // 85% chance user is active
  const trips = isActive ? Math.floor(Math.random() * 20) + 1 : 0;
  const hoursActive = isActive ? Math.round((Math.random() * 10 + 2) * 10) / 10 : 0;

  const zoneOptions = {
    mumbai: ["Andheri", "Bandra", "Juhu", "Powai"],
    delhi: ["Connaught Place", "Karol Bagh", "Saket", "Dwarka"],
    bangalore: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield"],
    chennai: ["T Nagar", "Anna Nagar", "Adyar", "Velachery"],
    hyderabad: ["Madhapur", "Gachibowli", "Banjara Hills", "Secunderabad"],
  };

  const zones = zoneOptions[city.toLowerCase()] || [zone];
  const coveredZones = isActive ? zones.slice(0, Math.ceil(Math.random() * zones.length)) : [];

  return {
    userId,
    active: isActive,
    trips,
    hoursActive,
    zonesCovered: coveredZones,
    lastActivity: isActive
      ? new Date(Date.now() - Math.random() * 12 * 3600000).toISOString()
      : new Date(Date.now() - 48 * 3600000).toISOString(),
    platform: "mock",
    timestamp: new Date().toISOString(),
  };
}

const VEHICLE_RISK = {
  bike: 1,
  scooter: 1.2,
  car: 1.5
}

export const calculatePremium = (vehicle, hours, cap) => {
  const normalizedVehicle = typeof vehicle === "string" ? vehicle.trim().toLowerCase() : ""
  const parsedHours = Number(hours)
  const parsedCap = Number(cap)
  const vehicleRisk = VEHICLE_RISK[normalizedVehicle]

  if (!vehicleRisk) {
    throw new Error("Unsupported vehicle type")
  }

  if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
    throw new Error("Hours per week must be a positive number")
  }

  if (!Number.isFinite(parsedCap) || parsedCap <= 0) {
    throw new Error("Coverage cap must be a positive number")
  }

  return Number((2 * parsedHours * parsedCap * vehicleRisk).toFixed(2))
}

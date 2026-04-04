import api from "./api"

export const calculatePremium = async (data) => {
  const res = await api.post("/premium/calculate", data)
  return res.data.premium
}
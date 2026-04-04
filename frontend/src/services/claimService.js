import api from "./api"

export const createClaim = async (data) => {
  const res = await api.post("/claims", data)
  return res.data
}
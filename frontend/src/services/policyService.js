import api from "./api"

export const getPolicies = async () => {
  const res = await api.get("/policies")
  return res.data
}
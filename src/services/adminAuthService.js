// Solution1 Admin Auth API
import adminApi from "@/api/adminApi";

/**
 * Admin girişi. POST /AdminAuth/login
 * Başarı: { token, email, role, userId, expiresAtUtc }
 */
export const loginAdmin = async (email, password) => {
  const response = await adminApi.post("/AdminAuth/login", { email, password });
  return response.data;
};

/**
 * Giriş yapan admin bilgisi. GET /AdminAuth/me (Bearer token gerekli)
 * Başarı: { userId, email, role }
 */
export const getAdminMe = async () => {
  const response = await adminApi.get("/AdminAuth/me");
  return response.data;
};

/**
 * Admin kaydı. POST /AdminAuth/register
 * Body: { name, surname, email, phone?, password }
 * Başarı: { token, email, role, userId, expiresAtUtc }
 */
export const registerAdmin = async (data) => {
  const response = await adminApi.post("/AdminAuth/register", data);
  return response.data;
};

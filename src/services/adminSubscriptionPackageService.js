// AdminSubscriptionPackageController — api/AdminSubscriptionPackage
// Rapor: docs/API-ADMIN-SUBSCRIPTION-PACKAGE-CONTROLLER-RAPORU.md
// categoryId zorunlu, categorySubId opsiyonel. GET /{id}, PUT /{id}, DELETE /{id}
import adminApi from "@/api/adminApi";

/**
 * Tüm abonelik paketlerini listele. GET /AdminSubscriptionPackage/all
 */
export const getAllSubscriptionPackages = async () => {
  const response = await adminApi.get("/AdminSubscriptionPackage/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Ana kategori (ve isteğe bağlı alt kategori) ile listele.
 * GET /AdminSubscriptionPackage/by-category?categoryId={guid}&categorySubId={guid}
 * categoryId zorunlu, categorySubId opsiyonel.
 */
export const getPackagesByCategory = async (categoryId, categorySubId = null) => {
  const params = { categoryId };
  if (categorySubId) params.categorySubId = categorySubId;
  const response = await adminApi.get("/AdminSubscriptionPackage/by-category", {
    params,
  });
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Paket detayı. GET /AdminSubscriptionPackage/{id}
 */
export const getSubscriptionPackageById = async (id) => {
  const response = await adminApi.get(`/AdminSubscriptionPackage/${id}`);
  return response.data;
};

/**
 * Paket oluştur. POST /AdminSubscriptionPackage/create
 * SubscriptionPackageCreateDto: categoryId zorunlu, categorySubId opsiyonel.
 */
export const createSubscriptionPackage = async (data) => {
  const response = await adminApi.post(
    "/AdminSubscriptionPackage/create",
    data
  );
  return response.data;
};

/**
 * Paket güncelle. PUT /AdminSubscriptionPackage/{id}
 * SubscriptionPackageUpdateDto: tüm alanlar opsiyonel.
 */
export const updateSubscriptionPackage = async (id, data) => {
  const response = await adminApi.put(
    `/AdminSubscriptionPackage/${id}`,
    data
  );
  return response.data;
};

/**
 * Paketi pasif yap (soft delete). DELETE /AdminSubscriptionPackage/{id}
 * Yanıt 200: { message: "..." }
 */
export const deleteSubscriptionPackage = async (id) => {
  const response = await adminApi.delete(`/AdminSubscriptionPackage/${id}`);
  return response.data;
};

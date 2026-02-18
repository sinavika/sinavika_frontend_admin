import adminApi from "@/api/adminApi";

/**
 * Tüm abonelik paketlerini listele. GET /AdminSubscriptionPackage/all
 */
export const getAllSubscriptionPackages = async () => {
  const response = await adminApi.get("/AdminSubscriptionPackage/all");
  return response.data;
};

/**
 * Paket detayı. GET /AdminSubscriptionPackage?id={id}
 */
export const getSubscriptionPackageById = async (id) => {
  const response = await adminApi.get("/AdminSubscriptionPackage", {
    params: { id },
  });
  return response.data;
};

/**
 * Paket oluştur. POST /AdminSubscriptionPackage/create
 */
export const createSubscriptionPackage = async (data) => {
  const response = await adminApi.post(
    "/AdminSubscriptionPackage/create",
    data
  );
  return response.data;
};

/**
 * Paket güncelle. PUT /AdminSubscriptionPackage/update?id={id}
 */
export const updateSubscriptionPackage = async (id, data) => {
  const response = await adminApi.put(
    "/AdminSubscriptionPackage/update",
    data,
    { params: { id } }
  );
  return response.data;
};

/**
 * Paket sil (pasif yapma). DELETE /AdminSubscriptionPackage/delete?id={id}
 */
export const deleteSubscriptionPackage = async (id) => {
  const response = await adminApi.delete(
    "/AdminSubscriptionPackage/delete",
    { params: { id } }
  );
  return response.data;
};

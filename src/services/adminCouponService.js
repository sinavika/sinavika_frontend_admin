import adminApi from "@/api/adminApi";

/**
 * Tüm kuponları listele. GET /AdminCoupon/all
 */
export const getAllCoupons = async () => {
  const response = await adminApi.get("/AdminCoupon/all");
  return response.data;
};

/**
 * Kupon detayı. GET /AdminCoupon?id={id}
 */
export const getCouponById = async (id) => {
  const response = await adminApi.get("/AdminCoupon", { params: { id } });
  return response.data;
};

/**
 * Kupon oluştur. POST /AdminCoupon/create
 */
export const createCoupon = async (data) => {
  const response = await adminApi.post("/AdminCoupon/create", data);
  return response.data;
};

/**
 * Kupon güncelle. PUT /AdminCoupon/update?id={id}
 */
export const updateCoupon = async (id, data) => {
  const response = await adminApi.put("/AdminCoupon/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Kupon sil (pasif yapma). DELETE /AdminCoupon/delete?id={id}
 */
export const deleteCoupon = async (id) => {
  const response = await adminApi.delete("/AdminCoupon/delete", {
    params: { id },
  });
  return response.data;
};

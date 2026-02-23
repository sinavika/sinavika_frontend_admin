// AdminCategorySubController — api/AdminCategorySub
// Doc: docs/Categories/01-Categories-Controllers-Tanitim.md, 02-Categories-API-Endpoints-Detay.md
import adminApi from "@/api/adminApi";

/**
 * Ana kategoriye göre alt kategorileri listele.
 * GET /AdminCategorySub/{categoryId}/subs
 * @param {string} categoryId Ana kategori id (Guid)
 */
export const getSubsByCategoryId = async (categoryId) => {
  const response = await adminApi.get(`/AdminCategorySub/${categoryId}/subs`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Alt kategori detayı. GET /AdminCategorySub?id={id}
 * @param {string} id Alt kategori id (Guid)
 */
export const getSubById = async (id) => {
  const response = await adminApi.get("/AdminCategorySub", { params: { id } });
  return response.data;
};

/**
 * Alt kategori oluştur. POST /AdminCategorySub/create
 * @param {{ categoryId: string, code: string, name: string, isActive?: boolean }} data — categoryId Guid
 */
export const createSub = async (data) => {
  const response = await adminApi.post("/AdminCategorySub/create", {
    categoryId: data.categoryId,
    code: data.code?.trim() ?? "",
    name: data.name?.trim() ?? "",
    isActive: data.isActive !== false,
  });
  return response.data;
};

/**
 * Alt kategori güncelle. PUT /AdminCategorySub/update?id={id}
 * @param {string} id Alt kategori id (Guid)
 * @param {{ code?: string, name?: string, isActive?: boolean }} data
 */
export const updateSub = async (id, data) => {
  const response = await adminApi.put("/AdminCategorySub/update", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Alt kategori sil. DELETE /AdminCategorySub/delete?id={id}
 * @param {string} id Alt kategori id (Guid)
 */
export const deleteSub = async (id) => {
  const response = await adminApi.delete("/AdminCategorySub/delete", {
    params: { id },
  });
  return response.data;
};

// AdminCategoryController — api/AdminCategory
// Doc: docs/Categories/01-Categories-Controllers-Tanitim.md, 02-Categories-API-Endpoints-Detay.md
import adminApi from "@/api/adminApi";

/**
 * Tüm kategorileri listele. GET /AdminCategory/all
 */
export const getAllCategories = async () => {
  const response = await adminApi.get("/AdminCategory/all");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Kategori detayı. GET /AdminCategory?id={id}
 */
export const getCategoryById = async (id) => {
  const response = await adminApi.get("/AdminCategory", { params: { id } });
  return response.data;
};

/**
 * Kategori oluştur. POST /AdminCategory/create (multipart/form-data)
 * Form: Code, Name, IsActive (boolean), file (opsiyonel)
 * @param {{ code: string, name: string, isActive?: boolean, file?: File }} data
 */
export const createCategory = async (data) => {
  const formData = new FormData();
  formData.append("Code", data.code ?? "");
  formData.append("Name", data.name ?? "");
  formData.append("IsActive", data.isActive !== false ? "true" : "false");
  if (data.file) formData.append("file", data.file);

  const response = await adminApi.post("/AdminCategory/create", formData);
  return response.data;
};

/**
 * Kategori bilgisi güncelle. PUT /AdminCategory/update-name?id={id}
 * @param {string} id Kategori id (Guid)
 * @param {{ code?: string, name?: string, isActive?: boolean }} data
 */
export const updateCategoryName = async (id, data) => {
  const response = await adminApi.put("/AdminCategory/update-name", data, {
    params: { id },
  });
  return response.data;
};

/**
 * Kategori resmini güncelle. PUT /AdminCategory/update-image?id={id} (multipart file)
 * @param {string} id Kategori id (Guid)
 * @param {File} file Görsel dosyası (zorunlu)
 */
export const updateCategoryImage = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await adminApi.put("/AdminCategory/update-image", formData, {
    params: { id },
  });
  return response.data;
};

/**
 * Kategori sil. DELETE /AdminCategory/delete?id={id}
 * @param {string} id Kategori id (Guid)
 */
export const deleteCategory = async (id) => {
  const response = await adminApi.delete("/AdminCategory/delete", {
    params: { id },
  });
  return response.data;
};

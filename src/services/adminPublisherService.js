import adminApi from "@/api/adminApi";

/**
 * Tüm yayınevlerini listele. GET /AdminPublisher/all
 */
export const getAllPublishers = async () => {
  const response = await adminApi.get("/AdminPublisher/all");
  return response.data;
};

/**
 * Yayınevi detayı. GET /AdminPublisher?id={id}
 */
export const getPublisherById = async (id) => {
  const response = await adminApi.get("/AdminPublisher", { params: { id } });
  return response.data;
};

/**
 * Yayınevi oluştur. POST /AdminPublisher/create (multipart/form-data)
 * Rapor 16.2: name, code, isActive, file (opsiyonel).
 */
export const createPublisher = async (data) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.code != null && data.code !== "") formData.append("code", data.code);
  formData.append("isActive", data.isActive !== false ? "true" : "false");
  if (data.file) formData.append("file", data.file);

  const response = await adminApi.post("/AdminPublisher/create", formData);
  return response.data;
};

/**
 * Yayınevi güncelle. PUT /AdminPublisher/update?id={id}
 * Rapor 16.4: body name, code, isActive.
 */
export const updatePublisher = async (id, data) => {
  const payload = {
    name: data.name,
    code: data.code,
    isActive: data.isActive,
  };
  const response = await adminApi.put("/AdminPublisher/update", payload, {
    params: { id },
  });
  return response.data;
};

/**
 * Yayınevi logosu güncelle. PUT /AdminPublisher/update-logo?id={id}
 */
export const updatePublisherLogo = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await adminApi.put("/AdminPublisher/update-logo", formData, {
    params: { id },
  });
  return response.data;
};

/**
 * Yayınevi sil (pasif yapma). DELETE /AdminPublisher/delete?id={id}
 */
export const deletePublisher = async (id) => {
  const response = await adminApi.delete("/AdminPublisher/delete", {
    params: { id },
  });
  return response.data;
};

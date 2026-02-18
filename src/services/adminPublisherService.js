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
 */
export const createPublisher = async (data) => {
  const formData = new FormData();
  if (data.name) formData.append("Name", data.name);
  if (data.legalName) formData.append("LegalName", data.legalName);
  if (data.taxNumber) formData.append("TaxNumber", data.taxNumber);
  if (data.taxOffice) formData.append("TaxOffice", data.taxOffice);
  if (data.websiteUrl) formData.append("WebsiteUrl", data.websiteUrl);
  if (data.supportEmail) formData.append("SupportEmail", data.supportEmail);
  if (data.phone) formData.append("Phone", data.phone);
  if (data.brandColorHex) formData.append("BrandColorHex", data.brandColorHex);
  formData.append("IsActive", data.isActive !== false ? "true" : "false");
  if (data.file) formData.append("file", data.file);

  const response = await adminApi.post("/AdminPublisher/create", formData);
  return response.data;
};

/**
 * Yayınevi güncelle. PUT /AdminPublisher/update?id={id}
 */
export const updatePublisher = async (id, data) => {
  const response = await adminApi.put("/AdminPublisher/update", data, {
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

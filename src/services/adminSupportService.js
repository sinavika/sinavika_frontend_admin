// AdminSupportController — api/admin/AdminSupport
// Destek taleplerini listeleme, detay ve durum güncelleme
import adminApi from "@/api/adminApi";

const BASE = "/admin/AdminSupport";

/**
 * Tüm destek taleplerini sayfalı listele. GET api/admin/AdminSupport?skip=0&take=50
 * take 1–200 arası sınırlanır. Sıralama: en yeni önce.
 * @returns { items: SupportTicketDto[], totalCount: number }
 */
export const getSupportTickets = async (skip = 0, take = 50) => {
  const safeTake = Math.min(200, Math.max(1, Number(take) || 50));
  const response = await adminApi.get(BASE, {
    params: { skip: Number(skip) || 0, take: safeTake },
  });
  return response.data;
};

/**
 * Tek destek talebi detayı (admin notları dahil). GET api/admin/AdminSupport/{id}
 */
export const getSupportTicketById = async (id) => {
  const response = await adminApi.get(`${BASE}/${id}`);
  return response.data;
};

/**
 * Talep durumu güncelle. PATCH api/admin/AdminSupport/{id}/status
 * Body: { status: number (0–7), adminNotes?: string }
 * @returns Güncellenmiş SupportTicketDto
 */
export const updateSupportTicketStatus = async (id, data) => {
  const response = await adminApi.patch(`${BASE}/${id}/status`, {
    status: Number(data.status),
    adminNotes: data.adminNotes != null && data.adminNotes !== "" ? String(data.adminNotes).trim() : undefined,
  });
  return response.data;
};

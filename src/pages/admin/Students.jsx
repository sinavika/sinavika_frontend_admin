import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, ChevronRight, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getStudents } from "@/services/adminStudentAuthManagementService";
import { ERROR_MESSAGES } from "@/constants";

const getApiError = (err) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.surname && s.surname.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && String(s.phone).toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  return (
    <div className="admin-page-wrapper students-page">
      <div className="admin-page-header students-page-header">
        <h1 className="admin-page-title students-page-title">
          <Users size={28} className="students-page-title-icon" />
          Öğrenci Yönetimi
        </h1>
      </div>

      <div className="students-toolbar">
        <div className="students-search-wrap">
          <Search size={18} className="students-search-icon" />
          <input
            type="search"
            placeholder="Ad, soyad, e-posta veya telefon ile ara…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input students-search-input"
            aria-label="Öğrenci ara"
          />
        </div>
        {searchQuery.trim() && (
          <span className="students-search-hint">
            {filteredStudents.length} sonuç
          </span>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : students.length === 0 ? (
        <div className="admin-empty-state students-empty-state">
          Henüz kayıtlı öğrenci yok.
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="admin-empty-state students-empty-state">
          Arama kriterine uygun öğrenci bulunamadı.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated students-card">
          <div className="admin-table-wrapper">
            <table className="admin-table students-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Soyad</th>
                  <th>E-posta</th>
                  <th>Telefon</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.surname}</td>
                    <td>{s.email ?? "—"}</td>
                    <td>{s.phone ?? "—"}</td>
                    <td className="text-right">
                      <Link
                        to={`/admin/students/${s.id}`}
                        className="admin-btn admin-btn-primary students-btn-detail"
                      >
                        <ChevronRight size={18} />
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

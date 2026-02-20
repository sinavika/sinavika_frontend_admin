import { Database } from "lucide-react";

const QuestionPool = () => {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="flex items-center gap-3">
          <Database size={28} className="text-emerald-600" />
          <div>
            <h1 className="admin-page-title">Soru havuzu</h1>
            <p className="admin-page-subtitle">İçerik yakında eklenecek.</p>
          </div>
        </div>
      </div>
      <div className="admin-card p-8 text-center text-slate-500">
        Bu sayfa yenilenecek. Yeni dokümantasyon (MD) ile güncellenecektir.
      </div>
    </div>
  );
};

export default QuestionPool;

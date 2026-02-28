import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, ShoppingCart, DollarSign, TrendingUp, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#6366f1"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 1234,
    orders: 512,
    revenue: 185432,
    growth: 12.5,
  });

  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    setLineData([
      { week: "01-07", revenue: 15000 },
      { week: "08-14", revenue: 22000 },
      { week: "15-21", revenue: 18000 },
      { week: "22-28", revenue: 25000 },
      { week: "29-04", revenue: 29000 },
    ]);

    setPieData([
      { name: "Elektronik", value: 400 },
      { name: "Moda", value: 300 },
      { name: "Ev & Yaşam", value: 300 },
      { name: "Spor", value: 200 },
    ]);

    setRecentUsers([
      { id: 1, name: "Ahmet Yılmaz", email: "ahmet@mail.com", joined: "2025-07-20" },
      { id: 2, name: "Ayşe Demir", email: "ayse@mail.com", joined: "2025-07-19" },
      { id: 3, name: "Mehmet Can", email: "mehmet@mail.com", joined: "2025-07-18" },
    ]);

    setRecentOrders([
      { id: 1, user: "Ayşe Demir", total: 850, status: "Hazırlanıyor" },
      { id: 2, user: "Ahmet Yılmaz", total: 1220, status: "Kargoya Verildi" },
      { id: 3, user: "Mehmet Can", total: 540, status: "Teslim Edildi" },
    ]);
  }, []);

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header admin-page-header-gradient flex flex-col gap-1 mb-6 sm:mb-8">
        <h1 className="admin-page-title">
          <LayoutDashboard size={28} className="text-emerald-600 shrink-0" />
          Kontrol Paneli
        </h1>
        <p className="text-sm text-slate-500">Özet istatistikler ve son aktiviteler.</p>
      </div>

      {/* Stat Boxes — proje paleti (emerald, amber, slate) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            icon: Users,
            label: "Kullanıcılar",
            value: stats.users,
            color: "bg-emerald-50 text-emerald-700 border border-emerald-100",
          },
          {
            icon: ShoppingCart,
            label: "Siparişler",
            value: stats.orders,
            color: "bg-amber-50 text-amber-700 border border-amber-100",
          },
          {
            icon: DollarSign,
            label: "Gelir",
            value: "₺" + stats.revenue.toLocaleString(),
            color: "bg-slate-50 text-slate-700 border border-slate-200",
          },
          {
            icon: TrendingUp,
            label: "Büyüme",
            value: `%${stats.growth}`,
            color: "bg-indigo-50 text-indigo-700 border border-indigo-100",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`admin-card p-4 sm:p-5 rounded-xl flex items-center justify-between gap-3 ${item.color}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium truncate opacity-90">{item.label}</p>
              <h3 className="text-lg sm:text-xl font-bold truncate mt-0.5">{item.value}</h3>
            </div>
            <item.icon size={26} className="shrink-0 opacity-80" />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="admin-card p-4 sm:p-6 rounded-xl lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Haftalık Gelir Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card p-4 sm:p-6 rounded-xl">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Satış Dağılımı</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="admin-card p-4 sm:p-6 rounded-xl overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Son Kullanıcılar</h2>
          <ul className="space-y-3">
            {recentUsers.map((user) => (
              <li key={user.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">Katıldı: {user.joined}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card p-4 sm:p-6 rounded-xl overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Son Siparişler</h2>
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="font-medium text-slate-800">{order.user}</p>
                <p className="text-sm text-slate-600">Tutar: ₺{order.total}</p>
                <p className="text-xs text-slate-500 mt-0.5">Durum: {order.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

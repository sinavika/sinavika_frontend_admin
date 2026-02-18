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
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#00b894", "#fdcb6e", "#0984e3", "#d63031"];

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen text-[#1b335a]">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Yönetim Paneli</h1>

      {/* Stat Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
        {[
          {
            icon: Users,
            label: "Kullanıcılar",
            value: stats.users,
            color: "bg-blue-100 text-blue-700",
          },
          {
            icon: ShoppingCart,
            label: "Siparişler",
            value: stats.orders,
            color: "bg-orange-100 text-orange-700",
          },
          {
            icon: DollarSign,
            label: "Gelir",
            value: "₺" + stats.revenue.toLocaleString(),
            color: "bg-green-100 text-green-700",
          },
          {
            icon: TrendingUp,
            label: "Büyüme",
            value: `%${stats.growth}`,
            color: "bg-purple-100 text-purple-700",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`p-4 sm:p-5 rounded-lg shadow-md flex items-center justify-between gap-2 ${item.color}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium truncate">{item.label}</p>
              <h3 className="text-base sm:text-xl font-bold truncate">{item.value}</h3>
            </div>
            <item.icon size={28} className="shrink-0 sm:w-8 sm:h-8" />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Haftalık Gelir Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#00b894" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Satış Dağılımı</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Son Kullanıcılar</h2>
          <ul className="space-y-3">
            {recentUsers.map((user) => (
              <li key={user.id} className="border-b pb-2">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">Katıldı: {user.joined}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Son Siparişler</h2>
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id} className="border-b pb-2">
                <p className="font-semibold">{order.user}</p>
                <p className="text-sm text-gray-600">Tutar: ₺{order.total}</p>
                <p className="text-xs text-gray-500">Durum: {order.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

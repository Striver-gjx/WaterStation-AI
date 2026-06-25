import React from 'react';
import { 
  DollarSign, 
  Users, 
  Ticket, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Package, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Customer, Order, TicketPackage, RedemptionLog, Product, OrderStatus } from '../types';
import { TRANSLATIONS } from '../translations';

interface DashboardTabProps {
  language: 'en' | 'zh';
  customers: Customer[];
  orders: Order[];
  ticketPackages: TicketPackage[];
  redemptionLogs: RedemptionLog[];
  products: Product[];
  onNavigate: (tab: string) => void;
}

export default function DashboardTab({
  language,
  customers,
  orders,
  ticketPackages,
  redemptionLogs,
  products,
  onNavigate
}: DashboardTabProps) {
  const t = TRANSLATIONS[language];

  // 1. Calculate Stats
  const todayStr = '2026-06-25'; // Fixed mock today for relative metrics
  
  const salesToday = orders
    .filter(o => o.orderDate === todayStr && o.status === OrderStatus.Paid)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeCustomersCount = customers.length;
  
  const totalTicketsRedeemed = redemptionLogs
    .filter(log => log.redemptionDate.startsWith('2026-06-25') || log.redemptionDate.startsWith('2026-06-24'))
    .reduce((sum, log) => sum + log.redeemedQty, 0);

  const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

  // 2. Prepare Chart Data
  // Weekly Sales Trend Data
  const salesTrendData = [
    { day: language === 'en' ? 'Mon' : '周一', sales: 420, redemptions: 12 },
    { day: language === 'en' ? 'Tue' : '周二', sales: 580, redemptions: 15 },
    { day: language === 'en' ? 'Wed' : '周三', sales: 510, redemptions: 14 },
    { day: language === 'en' ? 'Thu' : '周四', sales: 720, redemptions: 18 },
    { day: language === 'en' ? 'Fri' : '周五', sales: 900, redemptions: 22 },
    { day: language === 'en' ? 'Sat' : '周六', sales: 380, redemptions: 8 },
    { day: language === 'en' ? 'Sun' : '周日', sales: todayStr ? orders.filter(o => o.status === OrderStatus.Paid).reduce((sum, o) => sum + o.totalAmount, 0) : 480, redemptions: totalTicketsRedeemed || 10 },
  ];

  // Redemption vs Direct Sales ratio
  const directSalesCount = orders.filter(o => o.paymentMethod !== 'Water Ticket').length;
  const ticketRedemptionCount = redemptionLogs.length;

  const distributionData = [
    { name: language === 'en' ? 'Direct Purchases' : '直接购买订单', value: directSalesCount, color: '#3b82f6' },
    { name: language === 'en' ? 'Ticket Redemptions' : '水票兑换订单', value: ticketRedemptionCount, color: '#10b981' }
  ];

  return (
    <div className="space-y-6" id="dashboard-tab-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-teal-500 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t.operationalOverview}</h2>
          <p className="text-blue-100 text-sm mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {t.realtimeUpdate} • 2026-06-25 15:45 (UTC)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-xl text-sm font-medium flex items-center gap-1 border border-white/10"
          >
            {t.orders} <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onNavigate('waterTickets')}
            className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-900 transition rounded-xl text-sm font-semibold flex items-center gap-1 shadow-sm"
          >
            {t.quickRedeemTitle}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-semibold tracking-wide uppercase">{t.salesToday}</p>
            <h3 className="text-3xl font-extrabold text-slate-800">
              ${salesToday.toFixed(2)}
            </h3>
            <span className="inline-flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              +14.2% {t.vsYesterday}
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-semibold tracking-wide uppercase">{t.activeCustomers}</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{activeCustomersCount}</h3>
            <span className="inline-flex items-center text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
              {ticketPackages.length} {t.activeContracts}
            </span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-semibold tracking-wide uppercase">{t.ticketsRedeemed}</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{totalTicketsRedeemed}</h3>
            <span className="inline-flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
              {t.today}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-semibold tracking-wide uppercase">{t.lowStockAlerts}</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{lowStockCount}</h3>
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${lowStockCount > 0 ? 'text-amber-600 bg-amber-50 animate-pulse' : 'text-slate-500 bg-slate-100'}`}>
              {lowStockCount} {t.itemsLow}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h4 className="text-slate-800 font-bold">{t.salesTrend}</h4>
            </div>
            <span className="text-slate-400 text-xs font-mono">UTC-6</span>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#93c5fd' }}
                />
                <Area type="monotone" dataKey="sales" name={language === 'en' ? 'Sales Revenue ($)' : '销售额 (元)'} stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Sales Distribution (Pie Chart) */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h4 className="text-slate-800 font-bold">{t.redemptionRate}</h4>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} orders`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-800">
                {((ticketRedemptionCount / (directSalesCount + ticketRedemptionCount || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{language === 'en' ? 'Redeemed' : '兑换占比'}</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 mt-2">
            {distributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-800 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Redemptions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Redemptions */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-500" />
              <h4 className="text-slate-800 font-bold">{t.recentRedemptions}</h4>
            </div>
            <button 
              onClick={() => onNavigate('waterTickets')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 hover:underline"
            >
              {language === 'en' ? 'Manage Tickets' : '管理水票'} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">{t.customer}</th>
                  <th className="pb-3">{t.product}</th>
                  <th className="pb-3 text-center">{t.quantity}</th>
                  <th className="pb-3">{t.driver}</th>
                  <th className="pb-3 text-right">{t.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                {redemptionLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3 font-semibold text-slate-800">{log.customerName}</td>
                    <td className="py-3 text-slate-500">{log.productName}</td>
                    <td className="py-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                        -{log.redeemedQty}
                      </span>
                    </td>
                    <td className="py-3 flex items-center gap-1.5 text-slate-700">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      {log.driverName}
                    </td>
                    <td className="py-3 text-right text-slate-400 font-mono">{log.redemptionDate.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts & Tasklist */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h4 className="text-slate-800 font-bold">{t.alertsTasks}</h4>
          </div>

          <div className="space-y-3">
            {/* Alert 1 */}
            <div className="flex gap-3 p-3 bg-amber-50/70 hover:bg-amber-50 rounded-xl border border-amber-100/50 transition">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-800">{language === 'en' ? 'Stock Warning' : '库存不足预警'}</h5>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{t.alertStockLow}</p>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="flex gap-3 p-3 bg-red-50/70 hover:bg-red-50 rounded-xl border border-red-100/50 transition">
              <DollarSign className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-red-800">{language === 'en' ? 'Overdue Receivable' : '超期应付款提示'}</h5>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{t.alertBalanceVIP}</p>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="flex gap-3 p-3 bg-blue-50/70 hover:bg-blue-50 rounded-xl border border-blue-100/50 transition">
              <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-blue-800">{language === 'en' ? 'Deliveries Scheduled' : '今日调度待派发'}</h5>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{t.alertDeliveryPending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

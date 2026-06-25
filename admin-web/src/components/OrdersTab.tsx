import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  DollarSign, 
  Truck, 
  Calendar, 
  User, 
  Package, 
  CreditCard,
  X,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, DeliveryStatus, Customer, Product } from '../types';
import { TRANSLATIONS } from '../translations';

interface OrdersTabProps {
  language: 'en' | 'zh';
  orders: Order[];
  customers: Customer[];
  products: Product[];
  onCreateOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateDeliveryStatus: (orderId: string, status: DeliveryStatus) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function OrdersTab({
  language,
  orders,
  customers,
  products,
  onCreateOrder,
  onUpdateOrderStatus,
  onUpdateDeliveryStatus,
  onDeleteOrder
}: OrdersTabProps) {
  const t = TRANSLATIONS[language];

  // States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [deliveryFilter, setDeliveryFilter] = useState<'All' | DeliveryStatus>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form States for creating a new order
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formQty, setFormQty] = useState('1');
  const [formPaymentMethod, setFormPaymentMethod] = useState('WeChat Pay');
  const [formStatus, setFormStatus] = useState<OrderStatus>(OrderStatus.Paid);
  const [formDelivery, setFormDelivery] = useState<DeliveryStatus>(DeliveryStatus.Pending);
  const [formError, setFormError] = useState('');

  // Selected order details object
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase()) ||
                          o.productName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesDelivery = deliveryFilter === 'All' || o.deliveryStatus === deliveryFilter;

    return matchesSearch && matchesStatus && matchesDelivery;
  });

  // Calculate fields for creating form
  const selectedFormProduct = products.find(p => p.id === formProductId);
  const calculatedTotal = selectedFormProduct ? selectedFormProduct.price * formQty : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formProductId || formQty < 1) {
      setFormError(t.inputRequired);
      return;
    }

    const cust = customers.find(c => c.id === formCustomerId);
    const prod = products.find(p => p.id === formProductId);

    if (!cust || !prod) {
      setFormError(t.errorAction);
      return;
    }

    onCreateOrder({
      customerId: formCustomerId,
      customerName: cust.name,
      productId: formProductId,
      productName: prod.name,
      quantity: formQty,
      totalAmount: calculatedTotal,
      status: formStatus,
      deliveryStatus: formDelivery,
      paymentMethod: formPaymentMethod
    });

    // Reset fields
    setFormCustomerId('');
    setFormProductId('');
    setFormQty('1');
    setFormError('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6" id="orders-tab-container">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t.orderPipeline}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{filteredOrders.length} {language === 'en' ? 'orders total' : '个订单记录'}</p>
        </div>
        <button
          onClick={() => {
            if (customers.length > 0 && products.length > 0) {
              setFormCustomerId(customers[0].id);
              setFormProductId(products[0].id);
            }
            setIsCreateOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm hover:shadow self-start"
        >
          <Plus className="w-4 h-4" /> {t.createOrderBtn}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search by Order ID, Customer name...' : '搜索订单编号、客户姓名、产品名称...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Delivery Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value as any)}
              className="bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium outline-none"
            >
              <option value="All">{language === 'en' ? 'All Deliveries' : '所有配送进度'}</option>
              <option value={DeliveryStatus.Pending}>{language === 'en' ? 'Pending Deliveries' : '待派送'}</option>
              <option value={DeliveryStatus.InTransit}>{language === 'en' ? 'In Transit' : '配送中'}</option>
              <option value={DeliveryStatus.Delivered}>{language === 'en' ? 'Delivered' : '已送达'}</option>
            </select>
          </div>
        </div>

        {/* Status Filters Toggle Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-50">
          <span className="text-[11px] text-slate-400 font-medium mr-2 uppercase tracking-wider">{t.filterByPayment}:</span>
          {(['All', OrderStatus.Paid, OrderStatus.Pending, OrderStatus.Cancelled] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/50' 
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {st === 'All' ? t.all : 
               st === OrderStatus.Paid ? (language === 'en' ? 'Paid' : '已支付') :
               st === OrderStatus.Pending ? (language === 'en' ? 'Pending' : '未支付') :
               (language === 'en' ? 'Cancelled' : '已取消')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list - Left Column */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">{t.orderId}</th>
                  <th className="py-3 px-4">{t.customer}</th>
                  <th className="py-3 px-4">{t.product}</th>
                  <th className="py-3 px-4 text-center">{t.amount}</th>
                  <th className="py-3 px-4">{t.payment}</th>
                  <th className="py-3 px-4">{t.delivery}</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      {language === 'en' ? 'No orders found matching your search criteria.' : '未搜索到符合条件的订单。'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr 
                      key={o.id} 
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`hover:bg-blue-50/20 cursor-pointer transition duration-150 ${selectedOrderId === o.id ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{o.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{o.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {o.productName} <span className="text-[10px] text-slate-400">x{o.quantity}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">¥{o.totalAmount.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === OrderStatus.Paid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          o.status === OrderStatus.Pending ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {o.status === OrderStatus.Paid ? (language === 'en' ? 'Paid' : '已支付') :
                           o.status === OrderStatus.Pending ? (language === 'en' ? 'Pending' : '待结算') :
                           (language === 'en' ? 'Cancelled' : '已取消')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          o.deliveryStatus === DeliveryStatus.Delivered ? 'bg-blue-50 text-blue-700' :
                          o.deliveryStatus === DeliveryStatus.InTransit ? 'bg-indigo-50 text-indigo-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <Truck className="w-3 h-3" />
                          {o.deliveryStatus === DeliveryStatus.Delivered ? (language === 'en' ? 'Delivered' : '已送达') :
                           o.deliveryStatus === DeliveryStatus.InTransit ? (language === 'en' ? 'In Transit' : '配送中') :
                           (language === 'en' ? 'Pending' : '待调度')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected detail sidebar - Right Column */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-fit">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-500" />
                  {t.orderDetail}
                </h3>
                <span className="text-xs text-slate-400 font-mono font-semibold">{selectedOrder.id}</span>
              </div>

              {/* Order Status Timeline Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{language === 'en' ? 'Order Date' : '下单日期'}</span>
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.orderDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.paymentMethod}</span>
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.payment}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, OrderStatus.Paid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${selectedOrder.status === OrderStatus.Paid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                    >
                      {language === 'en' ? 'Paid' : '支付'}
                    </button>
                    <button 
                      onClick={() => onUpdateOrderStatus(selectedOrder.id, OrderStatus.Pending)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${selectedOrder.status === OrderStatus.Pending ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                    >
                      {language === 'en' ? 'Unpaid' : '未付'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer / Delivery Address Card */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                  <User className="w-4 h-4 text-blue-500" />
                  {selectedOrder.customerName}
                </div>
                {customers.find(c => c.id === selectedOrder.customerId) && (
                  <div className="text-[11px] text-slate-500 pl-6 space-y-1">
                    <p>📞 {customers.find(c => c.id === selectedOrder.customerId)?.phone}</p>
                    <p>📍 {customers.find(c => c.id === selectedOrder.customerId)?.address}</p>
                  </div>
                )}
              </div>

              {/* Items Card */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Products Purchased' : '订购明细'}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{selectedOrder.productName}</span>
                  <span className="text-slate-500">x{selectedOrder.quantity}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-2 flex justify-between text-xs font-bold text-slate-800">
                  <span>{language === 'en' ? 'Total Amount' : '应收合计'}</span>
                  <span>¥{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery dispatch updater */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t.updateStatus}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onUpdateDeliveryStatus(selectedOrder.id, DeliveryStatus.Pending)}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold text-center border transition ${selectedOrder.deliveryStatus === DeliveryStatus.Pending ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {language === 'en' ? 'Pending' : '待派送'}
                  </button>
                  <button
                    onClick={() => onUpdateDeliveryStatus(selectedOrder.id, DeliveryStatus.InTransit)}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold text-center border transition ${selectedOrder.deliveryStatus === DeliveryStatus.InTransit ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {language === 'en' ? 'In Transit' : '配送中'}
                  </button>
                  <button
                    onClick={() => onUpdateDeliveryStatus(selectedOrder.id, DeliveryStatus.Delivered)}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold text-center border transition ${selectedOrder.deliveryStatus === DeliveryStatus.Delivered ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {language === 'en' ? 'Delivered' : '已送达'}
                  </button>
                </div>
              </div>

              {/* Delete action */}
              <button
                onClick={() => {
                  if (confirm(language === 'en' ? 'Are you sure you want to delete this order?' : '确认删除此订单记录？')) {
                    onDeleteOrder(selectedOrder.id);
                    setSelectedOrderId(null);
                  }
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition text-center border border-rose-100"
              >
                {language === 'en' ? 'Delete Order Entry' : '删除此订单'}
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">{language === 'en' ? 'Select an order from the list to manage and view details.' : '从左侧列表中选择一个订单，以查看和更新配送状态。'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-blue-500" />
                {t.newOrderTitle}
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              {/* Customer Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.customer} *</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option value="" disabled>{language === 'en' ? '-- Select Customer --' : '-- 选择客户 --'}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              {/* Product Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.product} *</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option value="" disabled>{language === 'en' ? '-- Select Product --' : '-- 选择产品 --'}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'en' ? p.name : p.nameZh} - ¥{p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Quantity' : '订购数量'} *</label>
                  <input
                    type="number"
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-bold"
                  />
                </div>
                
                {/* Calculated Total Display */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{language === 'en' ? 'Calculated Total' : '计算总额'}</span>
                  <div className="h-10 bg-blue-50/50 border border-blue-100 rounded-xl px-3 flex items-center text-sm font-extrabold text-blue-700">
                    ¥{calculatedTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.paymentMethod}</label>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option value="Water Ticket">{language === 'en' ? 'Water Ticket' : '水票扣减'}</option>
                  <option value="WeChat Pay">{language === 'en' ? 'WeChat Pay' : '微信支付'}</option>
                  <option value="Alipay">{language === 'en' ? 'Alipay' : '支付宝'}</option>
                  <option value="Credit Card">{language === 'en' ? 'Credit Card' : '信用卡'}</option>
                  <option value="Cash">{language === 'en' ? 'Cash' : '现金支付'}</option>
                </select>
              </div>

              {/* Status selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.payment}</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  >
                    <option value={OrderStatus.Paid}>{language === 'en' ? 'Paid' : '已支付'}</option>
                    <option value={OrderStatus.Pending}>{language === 'en' ? 'Pending' : '待付'}</option>
                    <option value={OrderStatus.Cancelled}>{language === 'en' ? 'Cancelled' : '已取消'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.delivery}</label>
                  <select
                    value={formDelivery}
                    onChange={(e) => setFormDelivery(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  >
                    <option value={DeliveryStatus.Pending}>{language === 'en' ? 'Pending' : '待派送'}</option>
                    <option value={DeliveryStatus.InTransit}>{language === 'en' ? 'In Transit' : '配送中'}</option>
                    <option value={DeliveryStatus.Delivered}>{language === 'en' ? 'Delivered' : '已送达'}</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-semibold transition text-center"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition text-center shadow-sm"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

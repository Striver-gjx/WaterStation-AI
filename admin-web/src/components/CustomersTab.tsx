import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Award, 
  DollarSign, 
  Ticket, 
  ShoppingBag,
  History,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { Customer, CustomerTier, Order, TicketPackage } from '../types';
import { TRANSLATIONS } from '../translations';
import CJKInput from './CJKInput';

interface CustomersTabProps {
  language: 'en' | 'zh';
  customers: Customer[];
  orders: Order[];
  ticketPackages: TicketPackage[];
  onRegisterCustomer: (cust: Omit<Customer, 'id' | 'lastOrderDate' | 'lifetimeOrders'>) => void;
  onRecordPayment: (customerId: string, amount: number) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export default function CustomersTab({
  language,
  customers,
  orders,
  ticketPackages,
  onRegisterCustomer,
  onRecordPayment,
  onDeleteCustomer
}: CustomersTabProps) {
  const t = TRANSLATIONS[language];

  // States
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | CustomerTier>('All');
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State for registering a new customer
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTier, setFormTier] = useState<CustomerTier>(CustomerTier.Standard);
  const [formOutstanding, setFormOutstanding] = useState(0);
  const [formTickets, setFormTickets] = useState(0);
  const [formError, setFormError] = useState('');

  // Record Payment state in sidebar
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Find selected customer
  const selectedCustomer = customers.find(c => c.id === selectedCustId);

  // Customer filtration
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone.includes(search) ||
                          c.address.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase());

    const matchesTier = tierFilter === 'All' || c.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formPhone || !formAddress) {
      setFormError(t.inputRequired);
      return;
    }

    onRegisterCustomer({
      name: formName,
      phone: formPhone,
      address: formAddress,
      tier: formTier,
      outstandingBalance: formOutstanding,
      activeTickets: formTickets
    });

    setIsRegisterOpen(false);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormTier(CustomerTier.Standard);
    setFormOutstanding(0);
    setFormTickets(0);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccess('');

    if (!selectedCustomer) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(t.errorAction);
      return;
    }

    if (amt > selectedCustomer.outstandingBalance) {
      alert(
        language === 'en'
          ? `Warning: Payment amount (¥${amt}) exceeds outstanding balance (¥${selectedCustomer.outstandingBalance}).`
          : `实收金额 (¥${amt}) 大于未结款项 (¥${selectedCustomer.outstandingBalance})。`
      );
    }

    onRecordPayment(selectedCustomer.id, amt);
    setPaymentAmount('');
    setPaymentSuccess(
      language === 'en'
        ? `Successfully registered payment of ¥${amt.toFixed(2)}!`
        : `账款收回成功！已登记 ¥${amt.toFixed(2)}。`
    );

    setTimeout(() => setPaymentSuccess(''), 3000);
  };

  // Get selected customer statistics
  const customerOrders = orders.filter(o => o.customerId === selectedCustId);
  const customerPackages = ticketPackages.filter(p => p.customerId === selectedCustId);

  return (
    <div className="space-y-6" id="customers-tab-container">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t.customerDirectory}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{filteredCustomers.length} {language === 'en' ? 'customers registered' : '名已登记客户'}</p>
        </div>
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm hover:shadow self-start"
        >
          <Plus className="w-4 h-4" /> {t.addCustomerBtn}
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search by name, phone, address...' : '搜索姓名、手机号、地址、客户编号...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Tier Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t.tier}:</span>
            {(['All', CustomerTier.VIP, CustomerTier.Gold, CustomerTier.Standard] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  tierFilter === tier 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tier === 'All' ? t.all : tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Directory List & Side details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer list on Left (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">{t.customerName}</th>
                  <th className="py-3 px-4">{t.phone}</th>
                  <th className="py-3 px-4">{t.address}</th>
                  <th className="py-3 px-4 text-center">{t.tier}</th>
                  <th className="py-3 px-4 text-center">{t.activeTicketsCount}</th>
                  <th className="py-3 px-4 text-right">{t.outstanding}</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      {language === 'en' ? 'No customers found.' : '未找到匹配的客户记录。'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr 
                      key={c.id}
                      onClick={() => setSelectedCustId(c.id)}
                      className={`hover:bg-blue-50/20 cursor-pointer transition duration-150 ${selectedCustId === c.id ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-950">
                        {c.name}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">{c.id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{c.phone}</td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-400">{c.address}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.tier === CustomerTier.VIP ? 'bg-amber-100 text-amber-800' :
                          c.tier === CustomerTier.Gold ? 'bg-slate-100 text-slate-700' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          <Award className="w-3 h-3" />
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded-full">
                          {c.activeTickets}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${c.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        ¥{c.outstandingBalance.toFixed(2)}
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

        {/* Selected Customer Details on Right */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-fit">
          {selectedCustomer ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  {t.customerDetail}
                </h3>
                <span className="text-xs text-slate-400 font-mono font-semibold">{selectedCustomer.id}</span>
              </div>

              {/* General profile avatar and details */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-base shrink-0 border border-blue-200">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedCustomer.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2 py-0.5 font-bold uppercase">
                      {selectedCustomer.tier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone / Address details card */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
              </div>

              {/* Dynamic Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50/70 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">{t.outstanding}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                    ¥{selectedCustomer.outstandingBalance.toFixed(0)}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">{t.activeTicketsCount}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                    {selectedCustomer.activeTickets}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">{t.lifetimeOrdersCount}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                    {selectedCustomer.lifetimeOrders || customerOrders.length}
                  </span>
                </div>
              </div>

              {/* Record outstanding balance repayment section */}
              {selectedCustomer.outstandingBalance > 0 && (
                <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                    <h5 className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">{t.recordPayment}</h5>
                  </div>

                  {paymentSuccess && (
                    <div className="p-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg">
                      {paymentSuccess}
                    </div>
                  )}

                  <form onSubmit={handlePaymentSubmit} className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="flex-1 bg-white border border-rose-200/60 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-400 font-bold text-slate-700"
                    />
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition"
                    >
                      {language === 'en' ? 'Record' : '收回'}
                    </button>
                  </form>
                </div>
              )}

              {/* Customer Package Active Contracts list */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Active Packages' : '拥有的水票套餐'}</p>
                {customerPackages.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">{language === 'en' ? 'No active ticket contracts.' : '此客户暂无生效水票。'}</p>
                ) : (
                  <div className="space-y-1.5">
                    {customerPackages.map(pkg => (
                      <div key={pkg.id} className="bg-slate-50 p-2 rounded-xl flex justify-between items-center text-[11px]">
                        <div>
                          <p className="font-semibold text-slate-800">{pkg.productName}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{pkg.id}</p>
                        </div>
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {pkg.remainingTickets} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transactions History log list */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 border-b border-slate-100 pb-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.customerHistory}</p>
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">{language === 'en' ? 'No order history records.' : '暂无订单记录。'}</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto divide-y divide-slate-100">
                    {customerOrders.map(o => (
                      <div key={o.id} className="py-2 flex justify-between items-center text-[11px]">
                        <div>
                          <p className="font-semibold text-slate-800">{o.productName} x{o.quantity}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{o.orderDate} • {o.paymentMethod}</p>
                        </div>
                        <span className="font-bold text-slate-700">¥{o.totalAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete control */}
              <button
                onClick={() => {
                  if (confirm(language === 'en' ? 'Remove this customer from directory? This cannot be undone.' : '确定将此客户移出名录？对应记录将一并清除。')) {
                    onDeleteCustomer(selectedCustomer.id);
                    setSelectedCustId(null);
                  }
                }}
                className="w-full py-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-[11px] font-medium rounded-xl transition text-center border border-slate-100 hover:border-rose-100"
              >
                {language === 'en' ? 'Archive Customer Profile' : '注销该客户'}
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <User className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">{language === 'en' ? 'Select a customer from the catalog list to view full profile.' : '从左侧目录中选择一个客户，以查看其全景画像、购买水票记录及往期交易。'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Customer Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-blue-500" />
                {t.newCustomerTitle}
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.customerName} *</label>
                <CJKInput
                  type="text"
                  placeholder="e.g. Michael Scott"
                  value={formName}
                  onValueChange={setFormName}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.phone} *</label>
                <CJKInput
                  type="text"
                  placeholder="e.g. +1 555-0100"
                  value={formPhone}
                  onValueChange={setFormPhone}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.address} *</label>
                <CJKInput
                  type="text"
                  placeholder="e.g. 1725 Slough Avenue, Scranton"
                  value={formAddress}
                  onValueChange={setFormAddress}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  required
                />
              </div>

              {/* Tier & initial Outstanding balance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.tier}</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as CustomerTier)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  >
                    <option value={CustomerTier.Standard}>Standard</option>
                    <option value={CustomerTier.Gold}>Gold</option>
                    <option value={CustomerTier.VIP}>VIP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Initial Unpaid (¥)' : '首笔欠款金额 (¥)'}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formOutstanding}
                    onChange={(e) => setFormOutstanding(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Initial active tickets */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Preloaded Active Water Tickets' : '预载赠送/可用水票数'}</label>
                <input
                  type="number"
                  min="0"
                  value={formTickets}
                  onChange={(e) => setFormTickets(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-semibold transition text-center"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition text-center shadow-sm"
                >
                  {language === 'en' ? 'Register Customer' : '登记入库'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Ticket, 
  History, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  User, 
  Package, 
  Truck,
  Layers,
  ChevronRight,
  FileText,
  X
} from 'lucide-react';
import { TicketPackage, RedemptionLog, Customer, Product } from '../types';
import { TRANSLATIONS } from '../translations';

interface WaterTicketsTabProps {
  language: 'en' | 'zh';
  ticketPackages: TicketPackage[];
  redemptionLogs: RedemptionLog[];
  customers: Customer[];
  products: Product[];
  onRedeemTickets: (redemption: Omit<RedemptionLog, 'id' | 'redemptionDate'>) => void;
  onSellBundle: (bundle: Omit<TicketPackage, 'id' | 'purchaseDate' | 'status'>) => void;
}

export default function WaterTicketsTab({
  language,
  ticketPackages,
  redemptionLogs,
  customers,
  products,
  onRedeemTickets,
  onSellBundle
}: WaterTicketsTabProps) {
  const t = TRANSLATIONS[language];

  // Search filter for active packages
  const [search, setSearch] = useState('');
  
  // Modals / Flow states
  const [isSellOpen, setIsSellOpen] = useState(false);

  // REDEMPTION HUB Form State
  const [redCustomerId, setRedCustomerId] = useState('');
  const [redPackageId, setRedPackageId] = useState('');
  const [redQty, setRedQty] = useState('1');
  const [redDriver, setRedDriver] = useState('Robert Vance');
  const [redNotes, setRedNotes] = useState('');
  const [redSuccess, setRedSuccess] = useState('');
  const [redError, setRedError] = useState('');

  // SELL BUNDLE Form State
  const [sellCustomerId, setSellCustomerId] = useState('');
  const [sellProductId, setSellProductId] = useState('');
  const [sellTicketsQty, setSellTicketsQty] = useState(10);
  const [sellPrice, setSellPrice] = useState('240');
  const [sellError, setSellError] = useState('');

  // 1. Calculations
  const activePackages = ticketPackages.filter(pkg => pkg.remainingTickets > 0);
  
  const totalTicketsActiveCount = ticketPackages.reduce((sum, p) => sum + p.remainingTickets, 0);
  const totalTicketsIssuedCount = ticketPackages.reduce((sum, p) => sum + p.totalTickets, 0);

  // Dynamically load packages belonging to the selected customer in Redemption form
  const customerActivePackages = ticketPackages.filter(
    pkg => pkg.customerId === redCustomerId && pkg.remainingTickets > 0
  );

  const selectedPackage = ticketPackages.find(pkg => pkg.id === redPackageId);

  // Filter package directory list
  const filteredPackages = ticketPackages.filter(pkg => {
    return pkg.customerName.toLowerCase().includes(search.toLowerCase()) ||
           pkg.productName.toLowerCase().includes(search.toLowerCase()) ||
           pkg.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRedSuccess('');
    setRedError('');

    if (!redCustomerId || !redPackageId || redQty < 1) {
      setRedError(t.inputRequired);
      return;
    }

    const pkg = ticketPackages.find(p => p.id === redPackageId);
    if (!pkg) {
      setRedError(t.errorAction);
      return;
    }

    const redQtyNum = parseInt(redQty) || 0;

    if (pkg.remainingTickets < redQtyNum) {
      setRedError(
        language === 'en' 
          ? `Insufficient tickets. Remaining: ${pkg.remainingTickets}`
          : `水票余额不足。当前剩余：${pkg.remainingTickets} 张`
      );
      return;
    }

    onRedeemTickets({
      packageId: redPackageId,
      customerId: redCustomerId,
      customerName: pkg.customerName,
      productName: pkg.productName,
      redeemedQty: redQtyNum,
      remainingAfter: pkg.remainingTickets - redQtyNum,
      driverName: redDriver,
      notes: redNotes
    });

    setRedSuccess(
      language === 'en'
        ? `Successfully redeemed ${redQtyNum} tickets for ${pkg.customerName}!`
        : `兑换成功！已扣减 ${pkg.customerName} ${redQtyNum} 张水票。`
    );

    // Reset some states
    setRedQty('1');
    setRedNotes('');
    // Clear success after 3s
    setTimeout(() => setRedSuccess(''), 4000);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSellError('');

    if (!sellCustomerId || !sellProductId || sellTicketsQty < 1 || (parseInt(sellPrice) || 0) < 0) {
      setSellError(t.inputRequired);
      return;
    }

    const cust = customers.find(c => c.id === sellCustomerId);
    const prod = products.find(p => p.id === sellProductId);

    if (!cust || !prod) {
      setSellError(t.errorAction);
      return;
    }

    onSellBundle({
      customerId: sellCustomerId,
      customerName: cust.name,
      productId: sellProductId,
      productName: prod.name,
      totalTickets: sellTicketsQty,
      remainingTickets: sellTicketsQty,
      pricePaid: parseInt(sellPrice) || 0
    });

    setIsSellOpen(false);
    setSellCustomerId('');
    setSellProductId('');
    setSellTicketsQty(10);
    setSellPrice(240);
  };

  // Quick auto-populate bundle price when quantity/product changes in Selling Bundle
  const handleProductChangeForSell = (prodId: string) => {
    setSellProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      // Set typical pricing: bundle of 10 usually has 15% discount
      const singlePrice = prod.price;
      const basePrice = singlePrice * sellTicketsQty * 0.85;
      setSellPrice(Math.round(basePrice));
    }
  };

  const handleQtyChangeForSell = (qty: number) => {
    setSellTicketsQty(qty);
    const prod = products.find(p => p.id === sellProductId);
    if (prod) {
      const basePrice = prod.price * qty * 0.85;
      setSellPrice(String(Math.round(basePrice)));
    }
  };

  return (
    <div className="space-y-6" id="water-tickets-tab-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t.ticketManagement}</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {totalTicketsActiveCount} {language === 'en' ? 'unredeemed tickets active out of' : '张有效余量水票 / 累计发售'} {totalTicketsIssuedCount} {language === 'en' ? 'issued' : '张'}
          </p>
        </div>
        <button
          onClick={() => {
            if (customers.length > 0 && products.length > 0) {
              setSellCustomerId(customers[0].id);
              handleProductChangeForSell(products[0].id);
            }
            setIsSellOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm hover:shadow self-start"
        >
          <Plus className="w-4 h-4" /> {t.sellBundleBtn}
        </button>
      </div>

      {/* Main Grid: Redemption Hub on Left, active listings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Redemption Hub Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Ticket className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">{t.quickRedeemTitle}</h3>
          </div>

          <form onSubmit={handleRedeemSubmit} className="space-y-4 text-xs">
            {redSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4.5 h-4.5" /> {redSuccess}
              </div>
            )}
            {redError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5" /> {redError}
              </div>
            )}

            {/* Select Customer */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.selectCustomer} *</label>
              <select
                value={redCustomerId}
                onChange={(e) => {
                  setRedCustomerId(e.target.value);
                  setRedPackageId(''); // reset package selection
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
              >
                <option value="">{language === 'en' ? '-- Select Customer --' : '-- 选择兑换客户 --'}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                ))}
              </select>
            </div>

            {/* Select Active Ticket Package */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.selectPackage} *</label>
              <select
                value={redPackageId}
                onChange={(e) => setRedPackageId(e.target.value)}
                disabled={!redCustomerId}
                className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none disabled:opacity-50"
              >
                <option value="">
                  {!redCustomerId 
                    ? (language === 'en' ? 'Select customer first' : '请先选择上方客户') 
                    : customerActivePackages.length === 0 
                      ? (language === 'en' ? 'No active water tickets package!' : '该客户无可用水票合约！')
                      : (language === 'en' ? '-- Select Contract --' : '-- 选择生效的水票 --')}
                </option>
                {customerActivePackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.productName} ({pkg.remainingTickets}/{pkg.totalTickets} {language === 'en' ? 'left' : '张剩余'})
                  </option>
                ))}
              </select>
            </div>

            {/* Redeem Qty and Driver */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.redeemQty} *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPackage ? selectedPackage.remainingTickets : 100}
                  value={redQty}
                  onChange={(e) => setRedQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 font-extrabold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.dispatchDriver}</label>
                <select
                  value={redDriver}
                  onChange={(e) => setRedDriver(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option value="Robert Vance">Robert Vance</option>
                  <option value="Jason Statham">Jason Statham</option>
                  <option value="Arthur Dent">Arthur Dent</option>
                  <option value="Vance Refrigeration">Vance Delivery</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.redemptionNotes}</label>
              <textarea
                placeholder={language === 'en' ? 'e.g. Leave with security guard, 2nd floor pantry...' : '例如：送货上门放至前台，或配送至2楼茶水间...'}
                value={redNotes}
                onChange={(e) => setRedNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none h-16 resize-none"
              />
            </div>

            {/* Total display */}
            {selectedPackage && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/30 flex justify-between">
                <span className="text-slate-500">{language === 'en' ? 'Post-Redemption Bal:' : '兑换后水票余额：'}</span>
                <span className="font-extrabold text-emerald-800">
                  {selectedPackage.remainingTickets - redQty} / {selectedPackage.totalTickets}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4.5 h-4.5" />
              {t.redeemBtn}
            </button>
          </form>
        </div>

        {/* List of active contracts - Right Column */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-sm">{t.activePackages}</h3>
            </div>
            
            {/* Search inputs */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 focus:ring-2 focus:ring-blue-500 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-slate-700 placeholder-slate-400 outline-none border-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPackages.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400">
                {language === 'en' ? 'No ticket packages found.' : '未查找到水票合约记录。'}
              </div>
            ) : (
              filteredPackages.map((pkg) => (
                <div key={pkg.id} className="border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition duration-200 relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                  {/* Status Banner */}
                  <div className={`absolute top-0 right-0 px-3 py-0.5 text-[9px] font-extrabold uppercase rounded-bl-xl ${pkg.remainingTickets > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-300 text-slate-600'}`}>
                    {pkg.remainingTickets > 0 ? t.active : t.depleted}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.customerName}
                      </h4>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">{pkg.id}</p>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-100/50 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{t.product}</span>
                        <span className="text-slate-700 font-semibold text-right max-w-[120px] truncate">{pkg.productName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{t.purchaseDateLabel}</span>
                        <span className="text-slate-600 font-medium font-mono">{pkg.purchaseDate}</span>
                      </div>
                    </div>

                    {/* Progress Bar with big status */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">{t.remainingTicketsLabel}</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {pkg.remainingTickets} <span className="text-slate-400 font-normal">/ {pkg.totalTickets}</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            (pkg.remainingTickets / pkg.totalTickets) < 0.25 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(pkg.remainingTickets / pkg.totalTickets) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Redemption Log Activity Stream */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-800 text-sm">{t.redemptionHistory}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider pb-2">
                <th className="pb-3 px-3">{language === 'en' ? 'Log ID' : '流水编号'}</th>
                <th className="pb-3 px-3">{t.customer}</th>
                <th className="pb-3 px-3">{t.product}</th>
                <th className="pb-3 px-3 text-center">{t.redeemedLabel}</th>
                <th className="pb-3 px-3 text-center">{language === 'en' ? 'Remaining After' : '扣减后额度'}</th>
                <th className="pb-3 px-3">{t.driverLabel}</th>
                <th className="pb-3 px-3">{t.notes}</th>
                <th className="pb-3 px-3 text-right">{t.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {redemptionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">{log.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{log.customerName}</td>
                  <td className="py-3 px-3 text-slate-500">{log.productName}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      -{log.redeemedQty}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold font-mono text-slate-700">{log.remainingAfter}</td>
                  <td className="py-3 px-3 flex items-center gap-1.5 text-slate-700">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    {log.driverName}
                  </td>
                  <td className="py-3 px-3 text-slate-400 max-w-[150px] truncate">{log.notes || '-'}</td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono">{log.redemptionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sell Bundle Package Modal */}
      {isSellOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-emerald-500" />
                {t.sellBundleTitle}
              </h3>
              <button onClick={() => setIsSellOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="p-6 space-y-4 text-xs">
              {sellError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {sellError}
                </div>
              )}

              {/* Customer Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.selectCustomer} *</label>
                <select
                  value={sellCustomerId}
                  onChange={(e) => setSellCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              {/* Product Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Bundle Product' : '发售产品款型'} *</label>
                <select
                  value={sellProductId}
                  onChange={(e) => handleProductChangeForSell(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  {products.filter(p => p.category !== 'Equipment').map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'en' ? p.name : p.nameZh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total tickets Qty & Price Paid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Total Tickets' : '发售水票张数'} *</label>
                  <select
                    value={sellTicketsQty}
                    onChange={(e) => handleQtyChangeForSell(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none font-bold"
                  >
                    <option value="10">10 {language === 'en' ? 'Tickets' : '张'}</option>
                    <option value="20">20 {language === 'en' ? 'Tickets' : '张'}</option>
                    <option value="30">30 {language === 'en' ? 'Tickets' : '张'}</option>
                    <option value="50">50 {language === 'en' ? 'Tickets' : '张'}</option>
                    <option value="100">100 {language === 'en' ? 'Tickets' : '张'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Purchase Cost Paid' : '实收套餐金额'} *</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 font-extrabold outline-none"
                  />
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/30 text-[11px] text-emerald-800 space-y-1">
                <p>📍 {language === 'en' ? 'Discount Applied: ~15% bundle discount compared to single items.' : '套餐优惠：相比零售单价，本票本套餐已自动应用约 15% 优惠。'}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSellOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-semibold transition text-center"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition text-center shadow-sm"
                >
                  {language === 'en' ? 'Confirm and Sell' : '发售套餐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

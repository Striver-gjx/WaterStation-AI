import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Cpu, 
  Database, 
  RotateCcw, 
  Sliders, 
  Building2, 
  MapPin, 
  Percent, 
  Truck, 
  CheckCircle,
  Bell,
  Check
} from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import CJKInput from './CJKInput';

interface SettingsTabProps {
  language: 'en' | 'zh';
  onLanguageChange: (lang: 'en' | 'zh') => void;
  onResetData: () => void;
}

export default function SettingsTab({
  language,
  onLanguageChange,
  onResetData
}: SettingsTabProps) {
  const t = TRANSLATIONS[language];

  // Local settings states
  const [latency, setLatency] = useState(250);
  const [notifications, setNotifications] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(15.00);
  const [taxRate, setTaxRate] = useState(6.0);
  const [companyName, setCompanyName] = useState(t.companyName);
  const [companyAddress, setCompanyAddress] = useState(t.companyAddress);

  // Status flags
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-tab-container">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t.systemSettings}</h2>
        <p className="text-slate-500 text-xs mt-0.5">{language === 'en' ? 'Configure global operational parameters and presets.' : '管理业务规则参数、多语言切换、及模拟演示数据库。'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                <CheckCircle className="w-4.5 h-4.5 animate-bounce" /> {t.successAction}
              </div>
            )}

            {/* Language Setting */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Globe className="w-4.5 h-4.5 text-blue-500" />
                {t.languageSetting}
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                    language === 'en' 
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700' 
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{t.english}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Default Western layout</span>
                  </div>
                  {language === 'en' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => onLanguageChange('zh')}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                    language === 'zh' 
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700' 
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{t.chinese}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">中文简体极速版</span>
                  </div>
                  {language === 'zh' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>

            {/* Operational fees and taxation rules */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                {language === 'en' ? 'Dispatch & Accounting Fees' : '配送参数与账期规则'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Delivery fee */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider block">{t.deliveryCharge}</label>
                  <div className="relative">
                    <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Tax rate */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider block">{t.taxRate}</label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Company Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Building2 className="w-4.5 h-4.5 text-purple-500" />
                {t.companyDetails}
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider block">{language === 'en' ? 'Company Name' : '公司法定全称'}</label>
                  <CJKInput
                    type="text"
                    value={companyName}
                    onValueChange={setCompanyName}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider block">{language === 'en' ? 'Headquarters Address' : '注册经营地址'}</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <CJKInput
                      type="text"
                      value={companyAddress}
                      onValueChange={setCompanyAddress}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification and alert toggles */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Bell className="w-4.5 h-4.5 text-amber-500" />
                {language === 'en' ? 'Alerts & Sounds' : '消息推送与声音'}
              </h3>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-xs block">{t.notificationsEnabled}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{language === 'en' ? 'Send a browser popup reminder if barrel inventory fall short.' : '当大桶水或净水过滤器组件库存紧缺时，向顶栏发布横幅。'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full transition relative outline-none ${notifications ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 ${notifications ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-sm text-center"
            >
              {language === 'en' ? 'Save Settings Profile' : '保存系统配置'}
            </button>
          </form>
        </div>

        {/* Database management - Right Col */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">{t.dataManagement}</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* API Latency Simulator */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-slate-400" />
                  {t.simulatedLatency}
                </span>
                <span className="font-mono font-bold text-blue-600">{latency}ms</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="50"
                value={latency} 
                onChange={(e) => setLatency(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block leading-relaxed">{language === 'en' ? 'Simulates realistic backend pipeline response times when creating or editing items.' : '通过此滑动条可调节模拟真实网络中水厂调度微服务的 API 请求接口延迟。'}</span>
            </div>

            {/* Master hard reset database */}
            <div className="space-y-3 bg-rose-50/20 p-3.5 rounded-2xl border border-rose-100/50">
              <div className="flex items-center gap-1.5 text-rose-800">
                <RotateCcw className="w-4.5 h-4.5" />
                <h4 className="font-bold">{language === 'en' ? 'Master Factory Reset' : '重组数据库初始环境'}</h4>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">{t.resetWarning}</p>
              <button
                onClick={() => {
                  if (confirm(language === 'en' ? 'Revert to pristine mock data? Any custom customers, orders or redemptions will be deleted.' : '确认清空所有自定义数据并恢复至预设的 5 名核心演示客户？此操作不可撤销。')) {
                    onResetData();
                    alert(language === 'en' ? 'Data restored successfully!' : '初始演示数据已重构还原！');
                  }
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition text-center border border-rose-100"
              >
                {t.resetDataBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

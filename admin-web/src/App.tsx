import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Ticket, 
  Users, 
  FolderHeart, 
  Settings, 
  Languages, 
  Bell, 
  LogOut, 
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Import custom types & datasets
import { Customer, Order, TicketPackage, RedemptionLog, Product, OrderStatus, DeliveryStatus, CustomerTier } from './types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_TICKET_PACKAGES, 
  INITIAL_REDEMPTION_LOGS 
} from './mockData';
import { TRANSLATIONS } from './translations';
import { customerApi } from './api/customer';

// Import child views
import DashboardTab from './components/DashboardTab';
import OrdersTab from './components/OrdersTab';
import WaterTicketsTab from './components/WaterTicketsTab';
import CustomersTab from './components/CustomersTab';
import ProductsTab from './components/ProductsTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  // Load initial states with localStorage persistence support
  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    const cached = localStorage.getItem('aquaflow_lang');
    return (cached === 'en' || cached === 'zh') ? cached : 'en';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('aquaflow_tab') || 'dashboard';
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const cached = localStorage.getItem('aquaflow_customers');
    return cached ? JSON.parse(cached) : INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem('aquaflow_orders');
    return cached ? JSON.parse(cached) : INITIAL_ORDERS;
  });

  const [ticketPackages, setTicketPackages] = useState<TicketPackage[]>(() => {
    const cached = localStorage.getItem('aquaflow_ticket_packages');
    return cached ? JSON.parse(cached) : INITIAL_TICKET_PACKAGES;
  });

  const [redemptionLogs, setRedemptionLogs] = useState<RedemptionLog[]>(() => {
    const cached = localStorage.getItem('aquaflow_redemption_logs');
    return cached ? JSON.parse(cached) : INITIAL_REDEMPTION_LOGS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('aquaflow_products');
    return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
  });

  // System settings state (persisted in localStorage)
  const [settings, setSettings] = useState<{
    deliveryFee: string;
    taxRate: string;
    companyName: string;
    companyAddress: string;
    notifications: boolean;
    latency: number;
  }>(() => {
    const cached = localStorage.getItem('aquaflow_settings');
    return cached ? JSON.parse(cached) : {
      deliveryFee: '15',
      taxRate: '6',
      companyName: '',
      companyAddress: '',
      notifications: true,
      latency: 250,
    };
  });

  // Mobile sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Backend connection status
  const [backendError, setBackendError] = useState<{
    show: boolean;
    message: string;
    detail: string;
    suggestions: string[];
  } | null>(null);

  // Load data from backend API (check connectivity only, never overwrite local edits)
  useEffect(() => {
    let cancelled = false;
    const checkBackend = async () => {
      try {
        await customerApi.list({ page: 1, size: 1 });
        if (!cancelled) {
          setBackendError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const err = e as Error & { response?: { status?: number }; code?: string };
          let message: string;
          let detail: string;
          let suggestions: string[];

          if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
            message = language === 'zh'
              ? '无法连接到后端服务'
              : 'Cannot connect to backend service';
            detail = language === 'zh'
              ? '前端尝试请求 http://localhost:8080 但连接被拒绝。后端服务可能未启动或端口未监听。'
              : 'Frontend attempted to reach http://localhost:8080 but the connection was refused. The backend service may not be running.';
            suggestions = language === 'zh'
              ? [
                  '确认后端服务已启动（cd backend && mvn spring-boot:run）',
                  '检查后端是否监听在 8080 端口',
                  '检查是否有防火墙阻止本地连接',
                  '查看后端启动日志是否有报错',
                ]
              : [
                  'Ensure backend is running (cd backend && mvn spring-boot:run)',
                  'Verify backend is listening on port 8080',
                  'Check if a firewall is blocking local connections',
                  'Review backend startup logs for errors',
                ];
          } else if (err.response?.status === 502) {
            message = language === 'zh'
              ? '后端服务不可用（502 Bad Gateway）'
              : 'Backend unavailable (502 Bad Gateway)';
            detail = language === 'zh'
              ? '开发代理服务器无法将请求转发到后端。这通常意味着后端进程未运行或已崩溃。'
              : 'The dev proxy could not forward requests to the backend. This typically means the backend process is not running or has crashed.';
            suggestions = language === 'zh'
              ? [
                  '启动后端服务：cd backend && mvn spring-boot:run',
                  '如果后端曾启动过，检查是否因异常退出',
                  '检查 8080 端口是否被其他进程占用（lsof -i :8080）',
                ]
              : [
                  'Start backend: cd backend && mvn spring-boot:run',
                  'If backend was previously running, check if it crashed',
                  'Check if port 8080 is occupied (lsof -i :8080)',
                ];
          } else if (err.response?.status === 401 || err.response?.status === 403) {
            message = language === 'zh'
              ? '后端认证失败'
              : 'Backend authentication failed';
            detail = language === 'zh'
              ? `请求返回 HTTP ${err.response.status}，可能是认证 Token 缺失或已过期。`
              : `Request returned HTTP ${err.response.status}. Auth token may be missing or expired.`;
            suggestions = language === 'zh'
              ? ['检查登录状态', '清除浏览器缓存后重试']
              : ['Check login status', 'Clear browser cache and retry'];
          } else {
            message = language === 'zh'
              ? '后端请求失败'
              : 'Backend request failed';
            detail = err.message || (language === 'zh' ? '未知错误' : 'Unknown error');
            suggestions = language === 'zh'
              ? [
                  '检查后端服务是否正常运行',
                  '查看浏览器控制台（F12）获取详细错误信息',
                  '确认 API 接口路径是否正确',
                ]
              : [
                  'Check if backend service is running properly',
                  'Open browser console (F12) for detailed error info',
                  'Confirm API endpoint paths are correct',
                ];
          }

          setBackendError({ show: true, message, detail, suggestions });
        }
      }
    };
    checkBackend();
    return () => { cancelled = true; };
  }, [language]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aquaflow_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('aquaflow_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('aquaflow_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('aquaflow_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('aquaflow_ticket_packages', JSON.stringify(ticketPackages));
  }, [ticketPackages]);

  useEffect(() => {
    localStorage.setItem('aquaflow_redemption_logs', JSON.stringify(redemptionLogs));
  }, [redemptionLogs]);

  useEffect(() => {
    localStorage.setItem('aquaflow_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aquaflow_settings', JSON.stringify(settings));
  }, [settings]);

  // Translate helpers
  const t = TRANSLATIONS[language];

  // Global Handlers
  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleResetData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setTicketPackages(INITIAL_TICKET_PACKAGES);
    setRedemptionLogs(INITIAL_REDEMPTION_LOGS);
    setActiveTab('dashboard');
  };

  const handleExportData = () => {
    const exportPayload = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      platform: navigator.platform,
      customers,
      orders,
      products,
      ticketPackages,
      redemptionLogs,
      settings,
      language,
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `waterstation_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version) {
          alert(language === 'zh' ? '无效的数据文件：缺少版本号' : 'Invalid data file: missing version');
          return;
        }
        if (data.customers) setCustomers(data.customers);
        if (data.orders) setOrders(data.orders);
        if (data.products) setProducts(data.products);
        if (data.ticketPackages) setTicketPackages(data.ticketPackages);
        if (data.redemptionLogs) setRedemptionLogs(data.redemptionLogs);
        if (data.settings) setSettings(data.settings);
        if (data.language) setLanguage(data.language);
        setActiveTab('dashboard');
        alert(language === 'zh' ? '数据导入成功！' : 'Data imported successfully!');
      } catch (err) {
        alert(language === 'zh' ? '文件解析失败，请确认为有效的 JSON 备份文件' : 'File parse error. Please confirm it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // ORDER ACTIONS
  const handleCreateOrder = (newOrderData: Omit<Order, 'id' | 'orderDate'>) => {
    const nextId = `ORD-${1000 + orders.length + 1}`;
    const todayStr = '2026-06-25'; // Simulated system date

    const newOrder: Order = {
      ...newOrderData,
      id: nextId,
      orderDate: todayStr
    };

    setOrders(prev => [newOrder, ...prev]);

    // Side effects: update customer lifetime orders count & lastActive date
    setCustomers(prevCustomers => prevCustomers.map(c => {
      if (c.id === newOrderData.customerId) {
        return {
          ...c,
          lifetimeOrders: c.lifetimeOrders + 1,
          lastOrderDate: todayStr,
          outstandingBalance: newOrderData.status === OrderStatus.Pending 
            ? c.outstandingBalance + newOrderData.totalAmount 
            : c.outstandingBalance
        };
      }
      return c;
    }));

    // Side effects: deduct stocks for catalog item
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === newOrderData.productId) {
        const remainingStock = Math.max(0, p.stock - newOrderData.quantity);
        const status = remainingStock <= 0 ? '缺货' :
                       remainingStock <= p.maxStock * 0.2 ? '库存不足' : '有货';
        return {
          ...p,
          stock: remainingStock,
          status
        };
      }
      return p;
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // If order was pending, but is now paid, reduce outstanding balance of customer
    if (orderToUpdate.status === OrderStatus.Pending && status === OrderStatus.Paid) {
      setCustomers(prev => prev.map(c => {
        if (c.id === orderToUpdate.customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - orderToUpdate.totalAmount)
          };
        }
        return c;
      }));
    } 
    // If order was paid, but is now marked pending, increase outstanding balance
    else if (orderToUpdate.status === OrderStatus.Paid && status === OrderStatus.Pending) {
      setCustomers(prev => prev.map(c => {
        if (c.id === orderToUpdate.customerId) {
          return {
            ...c,
            outstandingBalance: c.outstandingBalance + orderToUpdate.totalAmount
          };
        }
        return c;
      }));
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateDeliveryStatus = (orderId: string, deliveryStatus: DeliveryStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryStatus } : o));
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // Refund unpaid balance if pending order is deleted
    if (orderToDelete.status === OrderStatus.Pending) {
      setCustomers(prev => prev.map(c => {
        if (c.id === orderToDelete.customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - orderToDelete.totalAmount)
          };
        }
        return c;
      }));
    }

    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // TICKET REDEMPTION ACTIONS
  const handleRedeemTickets = (redemptionData: Omit<RedemptionLog, 'id' | 'redemptionDate'>) => {
    const nextLogId = `RED-${9000 + redemptionLogs.length + 1}`;
    const todayStr = '2026-06-25'; // Simulated system date
    const timestamp = '2026-06-25 15:45';

    const newLog: RedemptionLog = {
      ...redemptionData,
      id: nextLogId,
      redemptionDate: timestamp
    };

    setRedemptionLogs(prev => [newLog, ...prev]);

    // Deduct remaining tickets from the target contract package
    setTicketPackages(prevPackages => prevPackages.map(pkg => {
      if (pkg.id === redemptionData.packageId) {
        const remaining = Math.max(0, pkg.remainingTickets - redemptionData.redeemedQty);
        return {
          ...pkg,
          remainingTickets: remaining,
          status: remaining <= 0 ? '已用完' : '使用中'
        };
      }
      return pkg;
    }));

    // Deduct total active tickets count on customer profile
    setCustomers(prevCustomers => prevCustomers.map(c => {
      if (c.id === redemptionData.customerId) {
        return {
          ...c,
          activeTickets: Math.max(0, c.activeTickets - redemptionData.redeemedQty),
          lifetimeOrders: c.lifetimeOrders + 1,
          lastOrderDate: todayStr
        };
      }
      return c;
    }));

    // Deduct stock levels of target product (use package's product)
    const pkg = ticketPackages.find(p => p.id === redemptionData.packageId);
    if (pkg) {
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === pkg.productId) {
          const remainingStock = Math.max(0, p.stock - redemptionData.redeemedQty);
          const status = remainingStock <= 0 ? '缺货' :
                         remainingStock <= p.maxStock * 0.2 ? '库存不足' : '有货';
          return {
            ...p,
            stock: remainingStock,
            status
          };
        }
        return p;
      }));
    }

    // Auto-generate a delivered delivery entry for tracking
    const matchingOrder: Order = {
      id: `ORD-${2000 + orders.length + 1}`,
      customerId: redemptionData.customerId,
      customerName: redemptionData.customerName,
      productId: pkg?.productId || 'PROD-001',
      productName: redemptionData.productName,
      quantity: redemptionData.redeemedQty,
      totalAmount: 0.00, // Water tickets is prepaid
      status: OrderStatus.Paid,
      deliveryStatus: DeliveryStatus.Delivered,
      orderDate: todayStr,
      paymentMethod: '水票兑换'
    };

    setOrders(prev => [matchingOrder, ...prev]);
  };

  const handleSellBundle = (bundleData: Omit<TicketPackage, 'id' | 'purchaseDate' | 'status'>) => {
    const nextPkgId = `PKG-${3000 + ticketPackages.length + 1}`;
    const todayStr = '2026-06-25';

    const newPkg: TicketPackage = {
      ...bundleData,
      id: nextPkgId,
      purchaseDate: todayStr,
      status: '使用中'
    };

    setTicketPackages(prev => [newPkg, ...prev]);

    // Add tickets to customer activeTickets total
    setCustomers(prev => prev.map(c => {
      if (c.id === bundleData.customerId) {
        return {
          ...c,
          activeTickets: c.activeTickets + bundleData.totalTickets,
          lifetimeOrders: c.lifetimeOrders + 1,
          lastOrderDate: todayStr
        };
      }
      return c;
    }));

    // Auto-generate purchase order
    const bundleOrder: Order = {
      id: `ORD-${1000 + orders.length + 1}`,
      customerId: bundleData.customerId,
      customerName: bundleData.customerName,
      productId: bundleData.productId,
      productName: `${bundleData.productName} (${bundleData.totalTickets}张水票)`,
      quantity: 1,
      totalAmount: bundleData.pricePaid,
      status: OrderStatus.Paid,
      deliveryStatus: DeliveryStatus.Delivered,
      orderDate: todayStr,
      paymentMethod: '现金支付'
    };

    setOrders(prev => [bundleOrder, ...prev]);
  };

  // CUSTOMER ACTIONS
  const handleRegisterCustomer = (custData: Omit<Customer, 'id' | 'lastOrderDate' | 'lifetimeOrders'>, ticketProductId?: string) => {
    const nextId = `CUST-00${customers.length + 1}`;
    const newCust: Customer = {
      ...custData,
      id: nextId,
      lifetimeOrders: 0,
      lastOrderDate: '2026-06-25'
    };

    setCustomers(prev => [...prev, newCust]);

    // If preloaded with initial water tickets, set up a contract bundle automatically!
    if (custData.activeTickets > 0 && ticketProductId) {
      const prod = products.find(p => p.id === ticketProductId);
      const pkgId = `PKG-${3000 + ticketPackages.length + 1}`;
      const newPkg: TicketPackage = {
        id: pkgId,
        customerId: nextId,
        customerName: custData.name,
        productId: ticketProductId,
        productName: prod ? (prod.nameZh || prod.name) : '未知产品',
        totalTickets: custData.activeTickets,
        remainingTickets: custData.activeTickets,
        purchaseDate: '2026-06-25',
        pricePaid: 0,
        status: '使用中'
      };
      setTicketPackages(prev => [newPkg, ...prev]);
    }
  };

  const handleRecordPayment = (customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          outstandingBalance: Math.max(0, c.outstandingBalance - amount)
        };
      }
      return c;
    }));
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    // Clear contracts belonging to customer
    setTicketPackages(prev => prev.filter(pkg => pkg.customerId !== customerId));
  };

  // PRODUCT ACTIONS
  const handleAddProduct = (prodData: Omit<Product, 'id' | 'status'>) => {
    const nextId = `PROD-${100 + products.length + 1}`;
    const status = prodData.stock <= 0 ? '缺货' :
                   prodData.stock <= prodData.maxStock * 0.2 ? '库存不足' : '有货';

    const newProd: Product = {
      ...prodData,
      id: nextId,
      status
    };

    setProducts(prev => [...prev, newProd]);
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const merged = { ...p, ...updates };
        const status = merged.stock <= 0 ? '缺货' :
                       merged.stock <= merged.maxStock * 0.2 ? '库存不足' : '有货';
        return {
          ...merged,
          status
        };
      }
      return p;
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col antialiased selection:bg-blue-100" id="aquaflow-root">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 lg:hidden focus:outline-none"
            >
              {isSidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Droplet className="w-5.5 h-5.5 fill-blue-100/10" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                {t.appName}
                <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-1.5 py-0.5 rounded-md">V2.4</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{language === 'en' ? 'Factory Control Hub' : '大同水业中控台'}</p>
            </div>
          </div>

          {/* Quick Info & User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick stats pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3.5 py-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === 'en' ? 'Operational Status:' : '当前运营:'}
              <span className="font-bold text-slate-900">{customers.length} {language === 'en' ? 'Cust' : '客户'}</span>
            </div>

            {/* Language Switcher Button */}
            <button
              onClick={handleLanguageToggle}
              title={t.selectLanguage}
              className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl text-slate-500 hover:text-blue-600 transition flex items-center gap-1 text-xs font-bold"
            >
              <Languages className="w-4.5 h-4.5" />
              <span className="hidden md:inline uppercase">{language}</span>
            </button>

            {/* Notification Bell */}
            <button className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            </button>

            {/* Admin Profile User card */}
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW_2R4MR3N-d0Xct73lc1VElx1LxWVC2LD7MrczXDA3bFJ-5ihvi6MDJ-WE4UPwkkvGmXzx4Al41UF_-mxgG4-LIWaOisNYO3aIESgmt635yeQ4GPEuQTWy_X0AevfGqwL3o9_LXcei07K8LOUKia0ZYG3GMQ-ObEqYv1ts0wSQs1NDBRsfUHQboSIVcs-y1QY6nXeEOIlIyZ75WO76hGXutqYCP8FcQiKVXxUvXEXXpTGyejxMM6MY39H7quRL6j4EnrjFPQpK5u6" 
                alt="John Doe Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-200" 
              />
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-none">John Doe</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">Senior Operator</p>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Backend Connection Error Banner */}
      {backendError?.show && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-amber-800">
                    {backendError.message}
                  </h3>
                  <button
                    onClick={() => setBackendError(prev => prev ? { ...prev, show: false } : null)}
                    className="p-1 hover:bg-amber-100 rounded text-amber-500 hover:text-amber-700 transition shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  {backendError.detail}
                </p>
                <p className="text-[11px] text-amber-600 mt-0.5 italic">
                  {language === 'zh'
                    ? '当前使用本地演示数据，所有操作仅保存在浏览器中。后端启动成功后刷新页面即可加载真实数据。'
                    : 'Currently using local demo data. All operations are saved in browser only. Refresh after backend starts to load real data.'}
                </p>
                <div className="mt-2 bg-amber-100/60 border border-amber-200/80 rounded-lg p-2.5">
                  <p className="text-[11px] font-semibold text-amber-800 mb-1.5">
                    {language === 'zh' ? '建议检查：' : 'Suggested checks:'}
                  </p>
                  <ul className="space-y-1">
                    {backendError.suggestions.map((s, i) => (
                      <li key={i} className="text-[11px] text-amber-700 flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold mt-px">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row p-4 gap-6">

        {/* Sidebar Navigation (Col 1) */}
        <aside className={`
          fixed inset-y-0 left-0 bg-white border-r border-slate-100 z-50 p-4 w-64 flex flex-col justify-between transition-transform duration-300 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:w-56 shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-6">
            
            {/* Mobile Sidebar Brand Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 lg:hidden">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                <span className="font-extrabold text-sm text-slate-800">{t.appName}</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-slate-50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Buttons Group */}
            <nav className="space-y-1">
              
              {/* Dashboard */}
              <button
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition font-semibold text-xs ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === 'dashboard' ? 'visible' : 'invisible'}`} />
              </button>

              {/* Orders */}
              <button
                onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition font-semibold text-xs ${
                  activeTab === 'orders' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4" />
                  {t.orders}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === 'orders' ? 'visible' : 'invisible'}`} />
              </button>

              {/* Water Tickets */}
              <button
                onClick={() => { setActiveTab('waterTickets'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition font-semibold text-xs ${
                  activeTab === 'waterTickets' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Ticket className="w-4 h-4" />
                  {t.waterTickets}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === 'waterTickets' ? 'visible' : 'invisible'}`} />
              </button>

              {/* Customers */}
              <button
                onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition font-semibold text-xs ${
                  activeTab === 'customers' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  {t.customers}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === 'customers' ? 'visible' : 'invisible'}`} />
              </button>

              {/* Products */}
              <button
                onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition font-semibold text-xs ${
                  activeTab === 'products' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FolderHeart className="w-4 h-4" />
                  {t.products}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === 'products' ? 'visible' : 'invisible'}`} />
              </button>

              {/* Settings */}
              <button
                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition font-semibold text-xs ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  {t.settings}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${activeTab === 'settings' ? 'visible' : 'invisible'}`} />
              </button>

            </nav>

          </div>

          {/* Quick Switch Database Reset helper */}
          <div className="bg-slate-100 border border-slate-200/50 p-3 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">{language === 'en' ? 'Quick Controls' : '快速操控'}</span>
            <button 
              disabled
              title="功能已禁用，防止误操作"
              className="w-full text-left py-1.5 px-2 bg-gray-100 text-gray-400 rounded-lg text-[11px] font-semibold transition border border-slate-200/50 block cursor-not-allowed opacity-60"
            >
              🔄 {language === 'en' ? 'Restructure DB' : '还原初始库数据'}
            </button>
          </div>

        </aside>

        {/* Content Panel Area (Col 2) */}
        <main className="flex-1 min-w-0">
          
          {/* Dynamic Render Tab component based on ActiveTab */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              language={language}
              customers={customers}
              orders={orders}
              ticketPackages={ticketPackages}
              redemptionLogs={redemptionLogs}
              products={products}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              language={language}
              orders={orders}
              customers={customers}
              products={products}
              onCreateOrder={handleCreateOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'waterTickets' && (
            <WaterTicketsTab
              language={language}
              ticketPackages={ticketPackages}
              redemptionLogs={redemptionLogs}
              customers={customers}
              products={products}
              onRedeemTickets={handleRedeemTickets}
              onSellBundle={handleSellBundle}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              language={language}
              customers={customers}
              orders={orders}
              ticketPackages={ticketPackages}
              products={products}
              onRegisterCustomer={handleRegisterCustomer}
              onRecordPayment={handleRecordPayment}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              language={language}
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              language={language}
              onLanguageChange={setLanguage}
              onResetData={handleResetData}
              onExportData={handleExportData}
              onImportData={handleImportData}
              settings={settings}
              onSettingsChange={setSettings}
            />
          )}

        </main>

      </div>

      {/* Footer System Credits */}
      <footer className="bg-white border-t border-slate-100 py-3 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider gap-2">
          <span>© 2026 {t.appName} Enterprise Admin Desk</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === 'en' ? 'Central Server Cluster Live' : '中央服务集群在线'}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

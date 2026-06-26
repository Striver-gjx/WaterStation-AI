import { Customer, CustomerTier, Product, Order, OrderStatus, DeliveryStatus, TicketPackage, RedemptionLog } from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Alex Rivera',
    phone: '+1 555-0199',
    address: '742 Evergreen Terrace, Springfield',
    tier: CustomerTier.VIP,
    outstandingBalance: 150.00,
    activeTickets: 12,
    lifetimeOrders: 42,
    lastOrderDate: '2026-06-24'
  },
  {
    id: 'CUST-002',
    name: 'Alex Thompson',
    phone: '+1 555-0142',
    address: '456 Elm Street, Riverdale',
    tier: CustomerTier.Gold,
    outstandingBalance: 0.00,
    activeTickets: 5,
    lifetimeOrders: 28,
    lastOrderDate: '2026-06-22'
  },
  {
    id: 'CUST-003',
    name: 'Linda Thompson',
    phone: '+1 555-0188',
    address: '101 Pine Road, Maplewood',
    tier: CustomerTier.VIP,
    outstandingBalance: 80.00,
    activeTickets: 24,
    lifetimeOrders: 61,
    lastOrderDate: '2026-06-25'
  },
  {
    id: 'CUST-004',
    name: 'Marcus Rivera',
    phone: '+1 555-0123',
    address: '202 Oak Avenue, Greenfield',
    tier: CustomerTier.Standard,
    outstandingBalance: 0.00,
    activeTickets: 0,
    lifetimeOrders: 15,
    lastOrderDate: '2026-06-18'
  },
  {
    id: 'CUST-005',
    name: 'Sarah Jenkins',
    phone: '+1 555-0177',
    address: '88 Birch Blvd, Fairview',
    tier: CustomerTier.Gold,
    outstandingBalance: 45.50,
    activeTickets: 8,
    lifetimeOrders: 19,
    lastOrderDate: '2026-06-25'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PROD-001',
    name: 'Premium 20L Jug',
    nameZh: '20L 优质大桶水',
    category: '桶装水',
    volume: '20L',
    price: 28.00,
    stock: 120,
    maxStock: 300,
    status: '有货',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPaktBDwEprciMfw6kb61uhJ4C8ZQR8c8LDcPzjUyxo5Tj7ozw1Y8tbSB6vTQbomm3tsy7W32kxb9vQEqISloU33Rc0BHHYuRM0im0akYfzx_3XnaJ4pz3dmaIby_eNCYIb8lpibkepZ4fNLW03aBTefAjLGkUJI8SuAtEjFi6K-RriUVq6dDNpodjawQ6tZlw0XHqDA_3k3EgwQnZY_q0HX5tH-njkWcjOMCtamrbvs9-cKyjUO9At1nTi96J4QIKFyhFS2TooUs'
  },
  {
    id: 'PROD-002',
    name: 'Purified 500ml Case',
    nameZh: '500ml 纯净水箱装 (24瓶)',
    category: '箱装水',
    volume: '500ml x 24',
    price: 35.00,
    stock: 24,
    maxStock: 250,
    status: '库存不足',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjG0qOr6L_5iSJ2H_6ik_4Oz7-_ZbM4pWJuKfdfJOlK-53eZF31YWHKhMTDVOzpVeutGyZ8Y5GFYRpI1e63foq_b2IyH1zf63NkmikLwZHX0dYo-bPE2p5LHNL3j_ktb19ZBevuJ6rSqgEYmuPNm0QARUFXghycuz6PzhoMML5WqI7fiPnfDwJX4dGrI5vxgOyNL4qgXx4ULVSW6Rpl0xWDOtUHkD5s2qrOA7CT0I1qAlmVhtvgCA7gQLse6LOfpRtNbyXXUZ5EQyH'
  },
  {
    id: 'PROD-003',
    name: 'Standard Filter Kit',
    nameZh: '标准净水过滤器套件',
    category: '设备',
    volume: 'N/A',
    price: 180.00,
    stock: 8,
    maxStock: 50,
    status: '库存不足',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-UsWftWffRK655MeRlKSj7BU5dSy21UDju_AbNCbFuRnXhYPIyzOlYdfTutyEyYZpQjTP7NoUxHj9lfF7O0MdS0OnB8MfxG500UlRSZIeVMIGP6kQqEP6vTs_TTj2x57CFXjSTYtLVc7oh03QRROjbHxlOI_wT1989cHppRQ4mCB99AK2qFwZsc8wBoG-eLbuVIWQrFVJ1_YXvsj4KzFifX4y3tgBiotJ2NFJoWB0wD08Ps_JNhp-x2cmJWTO7SRNYFqDjly1JjrT'
  },
  {
    id: 'PROD-004',
    name: 'Enterprise 20L Barrel x50 Bundle',
    nameZh: '企业级 20L 大桶水 x50 套餐',
    category: '套餐',
    volume: '20L x 50',
    price: 1100.00,
    stock: 99,
    maxStock: 100,
    status: '有货',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPaktBDwEprciMfw6kb61uhJ4C8ZQR8c8LDcPzjUyxo5Tj7ozw1Y8tbSB6vTQbomm3tsy7W32kxb9vQEqISloU33Rc0BHHYuRM0im0akYfzx_3XnaJ4pz3dmaIby_eNCYIb8lpibkepZ4fNLW03aBTefAjLGkUJI8SuAtEjFi6K-RriUVq6dDNpodjawQ6tZlw0XHqDA_3k3EgwQnZY_q0HX5tH-njkWcjOMCtamrbvs9-cKyjUO9At1nTi96J4QIKFyhFS2TooUs'
  },
  {
    id: 'PROD-005',
    name: 'Home 20L Barrel x10 Bundle',
    nameZh: '家庭装 20L 大桶水 x10 套餐',
    category: '套餐',
    volume: '20L x 10',
    price: 240.00,
    stock: 95,
    maxStock: 100,
    status: '有货',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPaktBDwEprciMfw6kb61uhJ4C8ZQR8c8LDcPzjUyxo5Tj7ozw1Y8tbSB6vTQbomm3tsy7W32kxb9vQEqISloU33Rc0BHHYuRM0im0akYfzx_3XnaJ4pz3dmaIby_eNCYIb8lpibkepZ4fNLW03aBTefAjLGkUJI8SuAtEjFi6K-RriUVq6dDNpodjawQ6tZlw0XHqDA_3k3EgwQnZY_q0HX5tH-njkWcjOMCtamrbvs9-cKyjUO9At1nTi96J4QIKFyhFS2TooUs'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerId: 'CUST-001',
    customerName: 'Alex Rivera',
    productId: 'PROD-001',
    productName: '大同优质矿泉水 20L',
    quantity: 3,
    totalAmount: 84.00,
    status: OrderStatus.Paid,
    deliveryStatus: DeliveryStatus.Delivered,
    orderDate: '2026-06-24',
    paymentMethod: '水票兑换'
  },
  {
    id: 'ORD-1002',
    customerId: 'CUST-003',
    customerName: 'Linda Thompson',
    productId: 'PROD-002',
    productName: '500ml 纯净水箱装 (24瓶)',
    quantity: 2,
    totalAmount: 70.00,
    status: OrderStatus.Paid,
    deliveryStatus: DeliveryStatus.InTransit,
    orderDate: '2026-06-25',
    paymentMethod: '支付宝'
  },
  {
    id: 'ORD-1003',
    customerId: 'CUST-002',
    customerName: 'Alex Thompson',
    productId: 'PROD-001',
    productName: '大同优质矿泉水 20L',
    quantity: 5,
    totalAmount: 140.00,
    status: OrderStatus.Pending,
    deliveryStatus: DeliveryStatus.Pending,
    orderDate: '2026-06-25',
    paymentMethod: '微信支付'
  },
  {
    id: 'ORD-1004',
    customerId: 'CUST-005',
    customerName: 'Sarah Jenkins',
    productId: 'PROD-003',
    productName: '标准净水过滤器套件',
    quantity: 1,
    totalAmount: 180.00,
    status: OrderStatus.Paid,
    deliveryStatus: DeliveryStatus.Delivered,
    orderDate: '2026-06-23',
    paymentMethod: '银行卡'
  },
  {
    id: 'ORD-1005',
    customerId: 'CUST-001',
    customerName: 'Alex Rivera',
    productId: 'PROD-005',
    productName: '家庭装 20L 大桶水 x10 套餐',
    quantity: 1,
    totalAmount: 240.00,
    status: OrderStatus.Paid,
    deliveryStatus: DeliveryStatus.Delivered,
    orderDate: '2026-06-15',
    paymentMethod: '微信支付'
  }
];

export const INITIAL_TICKET_PACKAGES: TicketPackage[] = [
  {
    id: 'PKG-3001',
    customerId: 'CUST-001',
    customerName: 'Alex Rivera',
    productName: '大同优质矿泉水 20L',
    productId: 'PROD-001',
    totalTickets: 20,
    remainingTickets: 12,
    purchaseDate: '2026-06-10',
    pricePaid: 450.00,
    status: '使用中'
  },
  {
    id: 'PKG-3002',
    customerId: 'CUST-002',
    customerName: 'Alex Thompson',
    productName: '大同优质矿泉水 20L',
    productId: 'PROD-001',
    totalTickets: 10,
    remainingTickets: 5,
    purchaseDate: '2026-06-12',
    pricePaid: 240.00,
    status: '使用中'
  },
  {
    id: 'PKG-3003',
    customerId: 'CUST-003',
    customerName: 'Linda Thompson',
    productName: '大同优质矿泉水 20L',
    productId: 'PROD-001',
    totalTickets: 30,
    remainingTickets: 24,
    purchaseDate: '2026-06-18',
    pricePaid: 650.00,
    status: '使用中'
  },
  {
    id: 'PKG-3004',
    customerId: 'CUST-005',
    customerName: 'Sarah Jenkins',
    productName: '500ml 纯净水箱装 (24瓶)',
    productId: 'PROD-002',
    totalTickets: 15,
    remainingTickets: 8,
    purchaseDate: '2026-06-15',
    pricePaid: 480.00,
    status: '使用中'
  }
];

export const INITIAL_REDEMPTION_LOGS: RedemptionLog[] = [
  {
    id: 'RED-9001',
    packageId: 'PKG-3001',
    customerId: 'CUST-001',
    customerName: 'Alex Rivera',
    productName: '大同优质矿泉水 20L',
    redeemedQty: 3,
    remainingAfter: 12,
    redemptionDate: '2026-06-24 14:32',
    driverName: '王大勇',
    notes: '放在前台'
  },
  {
    id: 'RED-9002',
    packageId: 'PKG-3003',
    customerId: 'CUST-003',
    customerName: 'Linda Thompson',
    productName: '大同优质矿泉水 20L',
    redeemedQty: 2,
    remainingAfter: 24,
    redemptionDate: '2026-06-25 09:15',
    driverName: '李强',
    notes: '送到3楼厨房'
  },
  {
    id: 'RED-9003',
    packageId: 'PKG-3002',
    customerId: 'CUST-002',
    customerName: 'Alex Thompson',
    productName: '大同优质矿泉水 20L',
    redeemedQty: 1,
    remainingAfter: 5,
    redemptionDate: '2026-06-22 11:45',
    driverName: '王大勇',
    notes: '快速交换'
  }
];

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Tag, 
  Package, 
  DollarSign, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  X,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';
import { TRANSLATIONS } from '../translations';
import CJKInput from './CJKInput';

interface ProductsTabProps {
  language: 'en' | 'zh';
  products: Product[];
  onAddProduct: (prod: Omit<Product, 'id' | 'status'>) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function ProductsTab({
  language,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: ProductsTabProps) {
  const t = TRANSLATIONS[language];

  // States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | Product['category']>('All');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for creating a product
  const [formName, setFormName] = useState('');
  const [formNameZh, setFormNameZh] = useState('');
  const [formCategory, setFormCategory] = useState<Product['category']>('桶装水');
  const [formVolume, setFormVolume] = useState('20L');
  const [formPrice, setFormPrice] = useState('28');
  const [formStock, setFormStock] = useState('100');
  const [formMaxStock, setFormMaxStock] = useState('200');
  const [formImage, setFormImage] = useState('');
  const [formImagePreview, setFormImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setFormImage(dataUrl);
      setFormImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Selected edit product states
  const editingProduct = products.find(p => p.id === editingProductId);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMaxStock, setEditMaxStock] = useState('');

  // Handle open editor panel
  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditPrice(String(prod.price));
    setEditStock(String(prod.stock));
    setEditMaxStock(String(prod.maxStock));
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.nameZh.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formNameZh || !formVolume || (parseFloat(formPrice) || 0) < 0 || (parseInt(formStock) || 0) < 0 || (parseInt(formMaxStock) || 0) < (parseInt(formStock) || 0)) {
      setFormError(t.inputRequired);
      return;
    }

    // Default placeholder water images if none provided
    const defaultImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPaktBDwEprciMfw6kb61uhJ4C8ZQR8c8LDcPzjUyxo5Tj7ozw1Y8tbSB6vTQbomm3tsy7W32kxb9vQEqISloU33Rc0BHHYuRM0im0akYfzx_3XnaJ4pz3dmaIby_eNCYIb8lpibkepZ4fNLW03aBTefAjLGkUJI8SuAtEjFi6K-RriUVq6dDNpodjawQ6tZlw0XHqDA_3k3EgwQnZY_q0HX5tH-njkWcjOMCtamrbvs9-cKyjUO9At1nTi96J4QIKFyhFS2TooUs';

    onAddProduct({
      name: formName,
      nameZh: formNameZh,
      category: formCategory,
      volume: formVolume,
      price: parseFloat(formPrice) || 0,
      stock: parseInt(formStock) || 0,
      maxStock: parseInt(formMaxStock) || 0,
      imageUrl: formImage.trim() || defaultImg
    });

    setIsAddOpen(false);
    setFormName('');
    setFormNameZh('');
    setFormCategory('桶装水');
    setFormVolume('20L');
    setFormPrice('28');
    setFormStock('100');
    setFormMaxStock('200');
    setFormImage('');
    setFormImagePreview('');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    onUpdateProduct(editingProductId, {
      price: parseFloat(editPrice) || 0,
      stock: parseInt(editStock) || 0,
      maxStock: parseInt(editMaxStock) || 0
    });

    setEditingProductId(null);
  };

  return (
    <div className="space-y-6" id="products-tab-container">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t.productCatalog}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{filteredProducts.length} {language === 'en' ? 'products listed' : '个目录款型'}</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm hover:shadow self-start"
        >
          <Plus className="w-4 h-4" /> {t.addProductBtn}
        </button>
      </div>

      {/* Categories Toggle and Search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search by catalog item name...' : '搜索产品名称...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', '桶装水', '箱装水', '设备', '套餐'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  categoryFilter === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat === 'All' ? t.all : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Catalog Cards & edit drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog List */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-2xl">
              {language === 'en' ? 'No catalog items match search.' : '该品类下暂无产品。'}
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div 
                key={p.id} 
                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between ${
                  editingProductId === p.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-100'
                }`}
              >
                {/* Product Image and Stock level badge */}
                <div className="relative h-44 bg-slate-50/50 flex items-center justify-center p-4">
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xs" 
                  />
                  
                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg">
                    {p.category}
                  </span>

                  {/* Stock Status Tag */}
                  <span className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg ${
                    p.status === '有货' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    p.status === '库存不足' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                    'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {p.status === '有货' ? t.inStock : 
                     p.status === '库存不足' ? t.lowStock : 
                     t.outOfStock}
                  </span>
                </div>

                {/* Info and actions */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {language === 'en' ? p.name : p.nameZh}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex justify-between">
                      <span>{p.id}</span>
                      <span className="font-semibold text-slate-500">{p.volume}</span>
                    </p>
                  </div>

                  {/* Pricing and Stock Counts */}
                  <div className="flex items-center justify-between border-t border-b border-slate-50 py-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t.price}</span>
                      <span className="text-sm font-extrabold text-slate-800 font-mono">
                        ¥{p.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t.stockLevel}</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {p.stock} <span className="text-slate-400 font-normal">/ {p.maxStock}</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress bar stock */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          (p.stock / p.maxStock) < 0.2 ? 'bg-rose-500' : 
                          (p.stock / p.maxStock) < 0.4 ? 'bg-amber-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (p.stock / p.maxStock) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-1.5">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t.edit}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(language === 'en' ? 'Delete product catalog entry?' : '确认删除此款型？')) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected edit product sidebar on Right */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-fit">
          {editingProduct ? (
            <form onSubmit={handleUpdateSubmit} className="space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-blue-500" />
                  {language === 'en' ? 'Update Catalog Specs' : '更新产品参数'}
                </h3>
                <span className="text-xs text-slate-400 font-mono font-semibold">{editingProduct.id}</span>
              </div>

              {/* Product mini card */}
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                <img src={editingProduct.imageUrl} alt="" referrerPolicy="no-referrer" className="w-10 h-10 object-contain rounded bg-white p-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-[11px] max-w-[150px] truncate">{language === 'en' ? editingProduct.name : editingProduct.nameZh}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block">{editingProduct.volume} • {editingProduct.category}</span>
                </div>
              </div>

              {/* Edit Price */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.price} (¥) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Edit Stocks counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Current Stock' : '当前库存'} *</label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Max Capacity' : '库存上限'} *</label>
                  <input
                    type="number"
                    min="1"
                    value={editMaxStock}
                    onChange={(e) => setEditMaxStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProductId(null)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-semibold transition text-center"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">{language === 'en' ? 'Select a product catalog item to edit or replenish stocks.' : '选择任一产品型录项，以修改单价或增减库存。'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Catalog Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-blue-500" />
                {t.newProductTitle}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              {/* Product Names (Bilingual support!) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.productNameEn} *</label>
                  <CJKInput
                    type="text"
                    placeholder="e.g. Mineral Water Case"
                    value={formName}
                    onValueChange={setFormName}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.productNameZh} *</label>
                  <CJKInput
                    type="text"
                    placeholder="例如：箱装矿泉水"
                    value={formNameZh}
                    onValueChange={setFormNameZh}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Category & Volume */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.category} *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  >
                    <option value="桶装水">桶装水</option>
                    <option value="箱装水">箱装水</option>
                    <option value="设备">设备/备件</option>
                    <option value="套餐">水票套餐</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.volume} *</label>
                  <input
                    type="text"
                    placeholder="e.g. 500ml x 24 or 20L"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Pricing, Stocks, Limits */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{t.price} (¥) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-2 py-2 text-xs text-slate-700 font-bold outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Initial Stock' : '初始库存'} *</label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-2 py-2 text-xs text-slate-700 font-bold outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Capacity' : '库存容量'} *</label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxStock}
                    onChange={(e) => setFormMaxStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl px-2 py-2 text-xs text-slate-700 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase tracking-wider">{language === 'en' ? 'Product Image URL (Optional)' : '产品型录图片链接 (选填)'}</label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-blue-100 transition-colors group"
                    title={language === 'en' ? 'Select image from folder' : '从文件夹选择图片'}
                  >
                    <ImageIcon className="w-4 h-4 text-blue-500 group-hover:text-blue-700" />
                  </button>
                  <input
                    type="url"
                    placeholder={language === 'en' ? 'https://... or click icon to select file' : 'https://... 或点击左侧图标从文件夹选择'}
                    value={formImage.startsWith('data:') ? (language === 'en' ? '📎 Local image selected' : '📎 已选择本地图片') : formImage}
                    onChange={(e) => { setFormImage(e.target.value); setFormImagePreview(''); }}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 outline-none"
                    readOnly={formImage.startsWith('data:')}
                  />
                </div>
                {formImagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img src={formImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => { setFormImage(''); setFormImagePreview(''); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
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

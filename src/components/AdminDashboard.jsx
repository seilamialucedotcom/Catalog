import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Package,
  Layers,
  Settings,
  Palette,
  Star,
} from 'lucide-react';
import { RichTextContent, RichTextDescriptionEditor } from './RichTextDescription';
import { formatPrice } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  createCategory,
  createBrand,
  createProduct,
  createSubcategory,
  deleteCategory,
  deleteProduct,
  deleteSubcategory,
  updateCategory,
  updateProduct,
  updateStoreSettings,
  getBrands,
} from '../services/admin';

export default function AdminDashboard({
  isOpen,
  onClose,
  products = [],
  categories = [],
  onRefreshData,
}) {
  const { logout } = useAuth();
  const { settings, updateSettingsState } = useTheme();

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'settings'

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    brand_name: '',
    stock: '',
    unit_type: 'unidad',
    portions: [],
    image_url: '',
    is_featured: false,
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image_url: '',
  });

  // Subcategory Form State
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCatForSub, setSelectedCatForSub] = useState('');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    store_name: settings.store_name || '',
    logo_url: settings.logo_url || '',
    primary_color: settings.primary_color || '#d99000',
    secondary_color: settings.secondary_color || '#181818',
    whatsapp_number: settings.whatsapp_number || '',
    secondary_whatsapp: settings.secondary_whatsapp || '',
    contact_email: settings.contact_email || '',
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [productImageStatus, setProductImageStatus] = useState('');
  const [categoryImageStatus, setCategoryImageStatus] = useState('');
  const [brands, setBrands] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  const normalizedProductSearch = productSearch.trim().toLocaleLowerCase();
  const filteredProducts = normalizedProductSearch
    ? products.filter((product) => [product.name, product.brand?.name, product.brand_name]
      .some((value) => String(value || '').toLocaleLowerCase().includes(normalizedProductSearch)))
    : products;

  const handleImageUpload = (event, setImageUrl, setStatus) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus('Selecciona un archivo de imagen válido.');
      event.target.value = '';
      return;
    }

    // Se conserva la imagen en el mismo campo que las URL, como data URL.
    // El límite evita generar peticiones y registros demasiado grandes.
    if (file.size > 1024 * 1024) {
      setStatus('La imagen debe pesar como máximo 1 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      setStatus('Imagen cargada desde el equipo. Guarda para aplicarla.');
      event.target.value = '';
    };
    reader.onerror = () => {
      setStatus('No se pudo leer el archivo seleccionado.');
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveStatus('Selecciona un archivo de imagen válido.');
      event.target.value = '';
      return;
    }

    // La imagen se guarda como data URL en localStorage, por lo que se limita
    // su tamaño para evitar exceder la cuota disponible del navegador.
    if (file.size > 1024 * 1024) {
      setSaveStatus('El logo debe pesar como máximo 1 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSettingsForm((current) => ({ ...current, logo_url: String(reader.result) }));
      setSaveStatus('Logo cargado. Guarda los ajustes para aplicarlo.');
    };
    reader.onerror = () => setSaveStatus('No se pudo leer el archivo seleccionado.');
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      setSettingsForm({
        store_name: settings.store_name || '',
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color || '#d99000',
        secondary_color: settings.secondary_color || '#181818',
        whatsapp_number: settings.whatsapp_number || '',
        secondary_whatsapp: settings.secondary_whatsapp || '',
        contact_email: settings.contact_email || '',
      });
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) return;

    getBrands().then(setBrands).catch((error) => {
      console.error('Error al cargar marcas:', error);
    });
  }, [isOpen]);

  // Bloqueo de scroll del body cuando cualquier modal administrativo esté abierto
  useEffect(() => {
    const anyModalOpen = isProductModalOpen || isCategoryModalOpen;
    const className = 'body-modal-open';

    if (anyModalOpen) {
      // Preferimos añadir una clase para permitir override CSS (y mantener estilos per-vista)
      document.body.classList.add(className);
      // También aplicamos style como respaldo para navegadores que no respeten la clase
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove(className);
      document.body.style.overflow = '';
    }

    // Cleanup por si el componente se desmonta
    return () => {
      document.body.classList.remove(className);
      document.body.style.overflow = '';
    };
  }, [isProductModalOpen, isCategoryModalOpen]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  // PRODUCT ACTIONS
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductImageStatus('');
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      subcategory_id: '',
      brand_id: '',
      brand_name: '',
      stock: '',
      unit_type: 'unidad',
      portions: [],
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      is_featured: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    const categoryId = prod.category_id ? String(prod.category_id) : '';
    const category = categories.find((item) => String(item.id) === categoryId);
    const subcategoryId = prod.subcategory_id ? String(prod.subcategory_id) : '';
    const hasSelectedSubcategory = category?.subcategories?.some(
      (subcategory) => String(subcategory.id) === subcategoryId,
    );

    setEditingProduct(prod);
    setProductImageStatus('');
    setProductForm({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      category_id: categoryId,
      subcategory_id: hasSelectedSubcategory ? subcategoryId : '',
      brand_id: prod.brand_id ? String(prod.brand_id) : '',
      brand_name: prod.brand?.name || '',
      stock: prod.stock ?? '',
      unit_type: prod.unit_type || 'unidad',
      portions: (prod.portions || []).map((portion) => ({
        label: portion.label || '',
        price: portion.price ?? '',
      })),
      image_url: prod.image_url || '',
      is_featured: Boolean(prod.is_featured),
    });
    setIsProductModalOpen(true);
  };

  const productSubcategories = categories.find(
    (category) => String(category.id) === String(productForm.category_id),
  )?.subcategories || [];

  const updatePortion = (index, field, value) => {
    setProductForm((current) => ({
      ...current,
      portions: current.portions.map((portion, portionIndex) => (
        portionIndex === index ? { ...portion, [field]: value } : portion
      )),
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const brandName = productForm.brand_name.trim();
      let brandId = productForm.brand_id || null;

      if (brandName) {
        const existingBrand = brands.find(
          (brand) => brand.name.toLocaleLowerCase() === brandName.toLocaleLowerCase(),
        );
        const brand = existingBrand || await createBrand({ name: brandName });
        brandId = brand.id;
        if (!existingBrand) setBrands((current) => [...current, brand].sort((a, b) => a.name.localeCompare(b.name)));
      }

      const { brand_name, ...formData } = productForm;
      const payload = {
        ...formData,
        brand_id: brandId,
        stock: productForm.stock === '' ? null : Number(productForm.stock),
      };

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setIsProductModalOpen(false);
      await onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      await onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory?.id) {
        await updateCategory(editingCategory.id, categoryForm);
      } else {
        await createCategory(categoryForm);
      }

      setIsCategoryModalOpen(false);
      await onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Deseas eliminar esta categoría y todas sus subcategorías?')) return;
    try {
      await deleteCategory(id);
      await onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!selectedCatForSub || !newSubcategoryName) return;

    try {
      await createSubcategory({
        category_id: selectedCatForSub,
        name: newSubcategoryName,
      });

      setNewSubcategoryName('');
      await onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubcategory = async (subId) => {
    if (!confirm('¿Eliminar esta subcategoría?')) return;
    try {
      await deleteSubcategory(subId);
      await onRefreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // SETTINGS ACTIONS
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveStatus('Guardando cambios...');

    try {
      const updated = await updateStoreSettings(settingsForm);
      updateSettingsState(updated);
      setSaveStatus('¡Ajustes guardados correctamente!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('Error al guardar.');
      alert(err.message);
    }
  };

  return (
    <div className="admin-dashboard fixed inset-0 z-50 overflow-y-auto bg-[#121212]/95 backdrop-blur-xl flex flex-col">
      {/* Top Navbar */}
      <div className="bg-[#181818] border-b border-[#2a2a2a] px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d99000]/20 border border-[#d99000]/40 flex items-center justify-center text-[#d99000] font-bold">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              Panel de Administración
            </h1>
            <p className="text-xs text-slate-400">Gestión de Catálogo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-rose-400 font-medium px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-rose-900 transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#252525] hover:bg-[#333333] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#d99000] text-slate-950 shadow-md'
                : 'bg-[#242424] text-slate-300 hover:text-white border border-[#333333]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#d99000] text-slate-950 shadow-md'
                : 'bg-[#242424] text-slate-300 hover:text-white border border-[#333333]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#d99000] text-slate-950 shadow-md'
                : 'bg-[#242424] text-slate-300 hover:text-white border border-[#333333]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Ajustes & Tema</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Catálogo de Productos</h3>
                <p className="text-xs text-slate-400">Gestiona precios, categorías, imágenes y estado destacado.</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Buscar por nombre o marca"
                    aria-label="Buscar productos por nombre o marca"
                    className="w-full rounded-xl border border-[#333333] bg-[#242424] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[#d99000] focus:outline-none sm:w-60"
                  />
                </label>
                <button
                  onClick={handleOpenCreateProduct}
                  className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#141414] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Precio</th>
                      <th className="py-3 px-4">Destacado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#202020] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#181818] border border-[#333333]"
                          />
                          <div>
                            <div className="font-bold text-slate-100">{prod.name}</div>
                            {prod.brand?.name && <div className="text-[10px] text-slate-400">{prod.brand.name}</div>}
                            <RichTextContent value={prod.description} className="line-clamp-1 max-w-xs text-[10px] text-slate-500" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#242424] border border-[#333333] text-[#d99000] text-[10px] font-semibold">
                            {prod.category_name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#d99000]">
                          {formatPrice(prod.price)}
                        </td>
                        <td className="py-3 px-4">
                          {prod.is_featured ? (
                            <span className="text-[#d99000] flex items-center gap-1 font-semibold">
                              <Star className="w-3 h-3 fill-current" /> Sí
                            </span>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-[#252525] hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                          No se encontraron productos con ese nombre o marca.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY & SUBCATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Category List & Add */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Categorías (Imágenes Circulares)</h3>
                  <p className="text-xs text-slate-400">Carga imágenes circulares para el menú de inicio.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryImageStatus('');
                    setCategoryForm({ name: '', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Categoría</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="glass-card p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#d99000]/40"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {cat.subcategories?.length || 0} subcategorías
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryImageStatus('');
                          setCategoryForm({ name: cat.name, image_url: cat.image_url });
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] text-slate-300 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg bg-[#252525] hover:bg-rose-950 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Subcategories Manager */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-bold text-white">Subcategorías Desplegables</h3>
              <p className="text-xs text-slate-400">Añade subgrupos para filtrar en el menú hamburguesa.</p>

              <form onSubmit={handleAddSubcategory} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Categoría Padre</label>
                  <select
                    value={selectedCatForSub}
                    onChange={(e) => setSelectedCatForSub(e.target.value)}
                    className="w-full bg-[#242424] border border-[#333333] text-slate-200 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                    required
                  >
                    <option value="">-- Seleccionar Categoría --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Nombre Subcategoría</label>
                  <input
                    type="text"
                    required
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Ej. Smartwatches"
                    className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#d99000] hover:bg-[#c48200] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
                >
                  Agregar Subcategoría
                </button>
              </form>

              {/* Existing Subcategories List */}
              <div className="pt-4 border-t border-[#2a2a2a] space-y-2 max-h-60 overflow-y-auto">
                {categories.flatMap(c => (c.subcategories || []).map(s => ({ ...s, catName: c.name }))).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-[#242424] border border-[#333333] text-xs">
                    <div>
                      <span className="font-medium text-slate-200">{sub.name}</span>
                      <span className="text-[10px] text-slate-500 block">({sub.catName})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubcategory(sub.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SETTINGS & DYNAMIC THEME ACCENTS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto glass-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Personalización del Catálogo y Tema</h3>
              <p className="text-xs text-slate-400">
                Los colores elegidos adaptarán dinámicamente el resplandor, botones, tarjetas y menú del catálogo.
              </p>
            </div>

            {saveStatus && (
              <div className="p-3 rounded-xl bg-[#242424] border border-[#d99000]/40 text-[#d99000] text-xs font-medium">
                {saveStatus}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">Nombre de la Tienda / Marca</label>
                <input
                  type="text"
                  required
                  value={settingsForm.store_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">Logo de la empresa</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settingsForm.logo_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                    placeholder="Pega la URL de la imagen"
                    className="flex-1 bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  />
                  {settingsForm.logo_url && (
                    <img
                      src={settingsForm.logo_url}
                      alt="Logo preview"
                      className="w-10 h-10 rounded-xl object-cover border border-[#d99000]/40 bg-[#181818]"
                    />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center rounded-xl border border-[#d99000]/40 bg-[#242424] px-3 py-2 text-xs font-semibold text-[#d99000] transition-colors hover:bg-[#303030] cursor-pointer">
                    Subir imagen desde el equipo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP, GIF o SVG; máximo 1 MB.</span>
                  {settingsForm.logo_url && (
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, logo_url: '' })}
                      className="text-xs text-slate-400 underline hover:text-rose-300 cursor-pointer"
                    >
                      Quitar logo
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Color Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#141414] border border-[#2a2a2a]">
                <div>
                  <label className="text-xs font-semibold text-[#d99000] block mb-2">Color Primario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsForm.primary_color}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={settingsForm.primary_color}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primary_color: e.target.value })}
                      className="w-28 bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-2">Color Secundario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsForm.secondary_color}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secondary_color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={settingsForm.secondary_color}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secondary_color: e.target.value })}
                      className="w-28 bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">Número de WhatsApp (para pedidos)</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp_number}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                  placeholder="+573001234567"
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">WhatsApp complementario (atención al cliente)</label>
                <input
                  type="text"
                  value={settingsForm.secondary_whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, secondary_whatsapp: e.target.value })}
                  placeholder="+519XXXXXXXX"
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">Correo de Contacto</label>
                <input
                  type="email"
                  value={settingsForm.contact_email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                  placeholder="contacto@mitienda.com"
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#d99000] hover:bg-[#c48200] text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow transition-all"
              >
                Guardar Cambios de Tienda
              </button>
            </form>
          </div>
        )}

      </div>

      {/* CREATE/EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6 overflow-auto">
          <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] rounded-2xl border border-[#2a2a2a] bg-[#181818] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-4 bg-[#181818]">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                title="Cerrar formulario"
                aria-label="Cerrar formulario"
                className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-[#303030] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#d99000] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[calc(100vh-6rem)]">
              <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Descripción</label>
                <RichTextDescriptionEditor
                  value={productForm.description}
                  onChange={(description) => setProductForm((current) => ({ ...current, description }))}
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Precio (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">Tipo de unidad</label>
                <select
                  value={productForm.unit_type}
                  onChange={(e) => setProductForm((current) => ({ ...current, unit_type: e.target.value }))}
                  className="w-full rounded-xl border border-[#333333] bg-[#242424] p-2.5 text-xs text-slate-100 focus:border-[#d99000] focus:outline-none"
                >
                  <option value="unidad">Unidad</option>
                  <option value="paquete">Paquete</option>
                  <option value="kg">Kilogramo (kg)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Marca</label>
                  <input
                    type="text"
                    list="product-brand-options"
                    value={productForm.brand_name}
                    onChange={(e) => {
                      const brandName = e.target.value;
                      const selectedBrand = brands.find(
                        (brand) => brand.name.toLocaleLowerCase() === brandName.trim().toLocaleLowerCase(),
                      );
                      setProductForm((current) => ({
                        ...current,
                        brand_name: brandName,
                        brand_id: selectedBrand ? String(selectedBrand.id) : '',
                      }));
                    }}
                    placeholder="Selecciona o escribe una marca"
                    className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  />
                  <datalist id="product-brand-options">
                    {brands.map((brand) => <option key={brand.id} value={brand.name} />)}
                  </datalist>
                  {productForm.brand_name.trim() && !brands.some(
                    (brand) => brand.name.toLocaleLowerCase() === productForm.brand_name.trim().toLocaleLowerCase(),
                  ) && (
                    <p className="mt-1 text-[10px] text-[#d99000]">Se crearÃ¡ esta marca al guardar.</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={(e) => setProductForm((current) => ({ ...current, stock: e.target.value }))}
                    placeholder="VacÃ­o = en stock"
                    className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">DÃ©jalo vacÃ­o para enviar <code>null</code>.</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Categoría</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm((current) => ({
                    ...current,
                    category_id: e.target.value,
                    subcategory_id: '',
                  }))}
                  className="w-full bg-[#242424] border border-[#333333] text-slate-200 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  required
                >
                  <option value="">-- Seleccionar Categoría --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Subcategoría</label>
                <select
                  value={productForm.subcategory_id}
                  onChange={(e) => setProductForm((current) => ({ ...current, subcategory_id: e.target.value }))}
                  disabled={!productForm.category_id || productSubcategories.length === 0}
                  className="w-full bg-[#242424] border border-[#333333] text-slate-200 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {productForm.category_id ? '-- Sin subcategoría --' : '-- Selecciona una categoría primero --'}
                  </option>
                  {productSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={String(subcategory.id)}>{subcategory.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 rounded-xl border border-[#333333] bg-[#202020] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Precios por porción</h4>
                    <p className="text-[10px] text-slate-400">Opcional: agrega una etiqueta y su precio.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductForm((current) => ({
                      ...current,
                      portions: [...current.portions, { label: '', price: '' }],
                    }))}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#d99000]/50 px-2 py-1.5 text-[10px] font-bold text-[#d99000] transition-colors hover:bg-[#d99000]/10"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar porción
                  </button>
                </div>

                {productForm.portions.map((portion, index) => (
                  <div key={index} className="grid grid-cols-[1fr_80px_auto] items-end gap-2 rounded-lg bg-[#242424] p-2">
                    <label className="min-w-0 text-[10px] text-slate-400">
                      Etiqueta
                      <input
                        type="text"
                        value={portion.label}
                        onChange={(e) => updatePortion(index, 'label', e.target.value)}
                        placeholder="Ej. 500g"
                        className="mt-1 w-full rounded-lg border border-[#3a3a3a] bg-[#181818] p-2 text-xs text-white focus:border-[#d99000] focus:outline-none"
                      />
                    </label>
                    <label className="text-[10px] text-slate-400">
                      Precio
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={portion.price}
                        onChange={(e) => updatePortion(index, 'price', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#3a3a3a] bg-[#181818] p-2 text-xs text-white focus:border-[#d99000] focus:outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setProductForm((current) => ({
                        ...current,
                        portions: current.portions.filter((_, portionIndex) => portionIndex !== index),
                      }))}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-950/50 hover:text-rose-300"
                      aria-label={`Eliminar porción ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Imagen del producto</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={productForm.image_url}
                    onChange={(e) => {
                      setProductForm({ ...productForm, image_url: e.target.value });
                      setProductImageStatus('');
                    }}
                    placeholder="Pega la URL de la imagen"
                    className="flex-1 bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  />
                  {productForm.image_url && (
                    <img
                      src={productForm.image_url}
                      alt="Vista previa del producto"
                      className="w-10 h-10 rounded-xl object-cover border border-[#d99000]/40 bg-[#181818]"
                    />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center rounded-xl border border-[#d99000]/40 bg-[#242424] px-3 py-2 text-xs font-semibold text-[#d99000] transition-colors hover:bg-[#303030] cursor-pointer">
                    Subir imagen desde el equipo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => handleImageUpload(
                        event,
                        (image_url) => setProductForm((current) => ({ ...current, image_url })),
                        setProductImageStatus,
                      )}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">O pega una URL. PNG, JPG, WebP o GIF; máximo 1 MB.</span>
                </div>
                {productImageStatus && (
                  <p className="mt-2 text-[11px] text-[#d99000]">{productImageStatus}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured_check"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-[#d99000] rounded bg-[#242424] border-[#333333]"
                />
                <label htmlFor="featured_check" className="text-xs text-slate-200 font-semibold cursor-pointer">
                  Marcar como Producto Destacado
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#d99000] hover:bg-[#c48200] text-slate-950 font-bold text-xs rounded-xl mt-3 cursor-pointer shadow transition-all"
              >
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* CREATE/EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ej. Audio & Sonido"
                  className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Imagen circular de la categoría</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={categoryForm.image_url}
                    onChange={(e) => {
                      setCategoryForm({ ...categoryForm, image_url: e.target.value });
                      setCategoryImageStatus('');
                    }}
                    placeholder="Pega la URL de la imagen"
                    className="flex-1 bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl p-2.5 focus:border-[#d99000] focus:outline-none"
                  />
                  {categoryForm.image_url && (
                    <img
                      src={categoryForm.image_url}
                      alt="Vista previa de la categoría"
                      className="w-10 h-10 rounded-full object-cover border border-[#d99000]/40 bg-[#181818]"
                    />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center rounded-xl border border-[#d99000]/40 bg-[#242424] px-3 py-2 text-xs font-semibold text-[#d99000] transition-colors hover:bg-[#303030] cursor-pointer">
                    Subir imagen desde el equipo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => handleImageUpload(
                        event,
                        (image_url) => setCategoryForm((current) => ({ ...current, image_url })),
                        setCategoryImageStatus,
                      )}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">O pega una URL. PNG, JPG, WebP o GIF; máximo 1 MB.</span>
                </div>
                {categoryImageStatus && (
                  <p className="mt-2 text-[11px] text-[#d99000]">{categoryImageStatus}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#d99000] hover:bg-[#c48200] text-slate-950 font-bold text-xs rounded-xl mt-2 cursor-pointer shadow transition-all"
              >
                Guardar Categoría
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

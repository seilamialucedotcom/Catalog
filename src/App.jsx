import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategorySlider from './components/CategorySlider';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import HamburgerMenu from './components/HamburgerMenu';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import { getProducts } from './services/product';
import { getCatalog } from './services/storesettings';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function MainCatalogApp() {
  const { user, isAdmin } = useAuth();

  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Modal & Drawer States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Automatically open Admin Dashboard if user is authenticated as Admin
  useEffect(() => {
    if (user && isAdmin) {
      setIsAdminOpen(true);
    } else {
      setIsAdminOpen(false);
    }
  }, [user, isAdmin]);

  // Fetch initial catalog state
  const loadCatalogData = async () => {
    setCatalogError('');
    try {
      const data = await getCatalog();
      setSettings(data.settings);
      setCategories(data.categories);
    } catch (err) {
      console.error('Error al cargar datos del catálogo:', err);
      setCatalogError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products based on active filters
  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const data = await getProducts({
        search: searchTerm,
        category_id: activeCategory,
        subcategory_id: activeSubcategory,
        is_featured: onlyFeatured,
      });
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setProductsError(err instanceof Error ? err.message : 'No se pudieron cargar los productos.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialCatalog = async () => {
      await loadCatalogData();
    };
    loadInitialCatalog();
  }, []);

  useEffect(() => {
    const loadFilteredProducts = async () => {
      await loadProducts();
    };
    loadFilteredProducts();
  }, [searchTerm, activeCategory, activeSubcategory, onlyFeatured]);

  // Derived active subcategories array
  const currentSubcategories = activeCategory !== null
    ? categories.find(c => c.id === activeCategory)?.subcategories || []
    : [];

  // Derived active category name
  const activeCategoryObj = categories.find(c => c.id === activeCategory);
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : (onlyFeatured ? 'Productos Destacados' : 'Todos los Productos');

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setActiveSubcategory(null);
    setOnlyFeatured(false);
  };

  const handleSelectSubcategory = (catId, subId) => {
    setActiveCategory(catId);
    setActiveSubcategory(subId);
    setOnlyFeatured(false);
  };

  const handleSelectFeaturedOnly = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
    setOnlyFeatured(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveCategory(null);
    setActiveSubcategory(null);
    setOnlyFeatured(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ede6db] flex flex-col items-center justify-center text-slate-800 p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#d99000] animate-spin flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#ede6db]"></div>
        </div>
        <p className="text-sm font-semibold tracking-wider text-[#d99000] animate-pulse">
          Cargando Catálogo...
        </p>
      </div>
    );
  }

  if (catalogError && !settings) {
    return (
      <div className="min-h-screen bg-[#ede6db] flex flex-col items-center justify-center text-slate-800 p-6 text-center">
        <h1 className="text-xl font-bold mb-2">No se pudo cargar el catálogo</h1>
        <p className="max-w-lg text-sm text-slate-600">{catalogError}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadCatalogData();
          }}
          className="mt-5 rounded-xl bg-[#d99000] px-4 py-2 text-sm font-bold text-slate-950"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ThemeProvider initialSettings={settings}>
      <CartProvider whatsappNumber={settings?.whatsapp_number} storeName={settings?.store_name}>
        <div className="min-h-screen bg-[#ede6db] text-slate-100 font-sans selection:bg-[#d99000] selection:text-slate-950 flex flex-col justify-between">
          
          <div>
            {/* Header */}
            <Header
              onOpenMenu={() => setIsMenuOpen(true)}
              onOpenAdmin={() => setIsAdminOpen(true)}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeCategory={activeCategory}
              resetFilters={handleClearFilters}
            />

            {/* Circular Category Slider */}
            <CategorySlider
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* Search & Subcategories Bar */}
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              subcategories={currentSubcategories}
              activeSubcategory={activeSubcategory}
              onSelectSubcategory={(subId) => setActiveSubcategory(subId)}
              onClearFilters={handleClearFilters}
              totalResultsCount={products.length}
            />

            {/* Product Grid */}
            <ProductGrid
              products={products}
              onQuickView={(p) => setQuickViewProduct(p)}
              activeCategoryName={activeCategoryName}
            />
            {productsLoading && (
              <p className="px-4 pb-4 text-center text-sm text-slate-500">Cargando productos...</p>
            )}
            {productsError && (
              <p className="mx-4 mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-center text-sm text-rose-700">
                {productsError}
              </p>
            )}
          </div>

          {/* Clean Minimalist Footer */}
          <footer className="border-t border-slate-300/60 bg-[#ede6db] py-6 text-center text-xs text-slate-600">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-medium text-slate-700">
                {settings?.store_name || 'Catálogo'}
              </p>
            </div>
          </footer>

          {/* Slide-over Hamburger Menu */}
          <HamburgerMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            categories={categories}
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelectCategory={handleSelectCategory}
            onSelectSubcategory={handleSelectSubcategory}
            onSelectFeaturedOnly={handleSelectFeaturedOnly}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />

          {/* Product Quick View Modal */}
          {quickViewProduct && (
            <ProductModal
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
            />
          )}

          {/* Quote / Order Cart Drawer */}
          <CartDrawer />

          {/* User / Admin Login Modal */}
          <LoginModal />

          {/* Admin Dashboard */}
          <AdminDashboard
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            products={products}
            categories={categories}
            onRefreshData={async () => {
              await Promise.all([loadCatalogData(), loadProducts()]);
            }}
          />

        </div>
      </CartProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainCatalogApp />
    </AuthProvider>
  );
}

import React from 'react';
import { Menu, ShoppingBag, User, ShieldCheck, Search, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header({
  onOpenMenu,
  onOpenAdmin,
  searchTerm,
  setSearchTerm,
  activeCategory,
  resetFilters,
}) {
  const { settings } = useTheme();
  const { user, isAdmin, openLoginModal, logout } = useAuth();
  const { totalItemsCount, openCart } = useCart();

  // Helper to render brand name with gold highlighting as seen in image "Aura CyberCatalog"
  const renderBrandName = (name) => {
    if (!name) return <span className="text-white">Aura <span className="text-[#d99000]">CyberCatalog</span></span>;
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (
        <>
          <span className="text-white">{parts[0]} </span>
          <span className="text-[#d99000]">{parts.slice(1).join(' ')}</span>
        </>
      );
    }
    return <span className="text-[#d99000]">{name}</span>;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#181818] border-b border-[#2a2a2a] shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger Menu & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="p-2 sm:p-2.5 rounded-lg bg-[#181818] hover:bg-[#252525] active:scale-95 border border-[#383838] text-white transition-all cursor-pointer hover:border-[#d99000]/50"
            title="Abrir Menú de Categorías"
            aria-label="Abrir Menú"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div
            onClick={resetFilters}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {settings.logo_url ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-[#d99000]/40 p-0.5 bg-[#181818] shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <img
                  src={settings.logo_url}
                  alt={settings.store_name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#d99000] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                A
              </div>
            )}
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight leading-none group-hover:text-[#d99000] transition-colors">
                  {renderBrandName(settings.store_name)}
                </h1>
                <span className="relative flex h-2 w-2" title="Catálogo En Línea">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick Search Input Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder=""
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-md pl-10 pr-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d99000] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Right: Cart Quote Drawer & Auth / Admin Panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Button with Gold Badge */}
          <button
            onClick={openCart}
            className="relative p-2 sm:p-2.5 rounded-lg bg-[#181818] hover:bg-[#252525] active:scale-95 border border-[#383838] text-white transition-all cursor-pointer flex items-center gap-2 hover:border-[#d99000]/50 group"
            title="Ver Cotización / Pedido"
          >
            <ShoppingBag className="w-5 h-5 text-white group-hover:text-[#d99000] group-hover:scale-110 transition-all duration-200" />
            <span className="hidden lg:inline text-xs font-semibold">Cotización</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#d99000] text-slate-950 text-[11px] font-black flex items-center justify-center shadow-md animate-bounce">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Admin / Login Button */}
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={onOpenAdmin}
                  className="bg-[#d99000] hover:bg-[#c48200] text-slate-950 text-xs font-bold flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-lg transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#181818] border border-[#383838] text-white text-xs font-semibold">
                  <User className="w-4 h-4 text-[#d99000]" />
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-[#181818] hover:bg-rose-950/40 border border-[#383838] hover:border-rose-900 text-slate-300 hover:text-rose-400 transition-all cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#252525] border border-[#383838] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4 text-white" />
              <span>Usuario Cliente</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

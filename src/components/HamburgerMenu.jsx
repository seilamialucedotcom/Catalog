import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Layers, Sparkles, ShieldCheck, Phone, Mail, Home, Star, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HamburgerMenu({
  isOpen,
  onClose,
  categories = [],
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onSelectFeaturedOnly,
  onOpenAdmin,
}) {
  const { settings } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!isOpen) return null;

  const toggleCategoryExpand = (catId, e) => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 drawer-backdrop transition-opacity animate-fadeIn"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-[#181818] border-r border-[#2a2a2a] shadow-2xl flex flex-col justify-between overflow-y-auto">
          
          {/* Header */}
          <div>
            <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between bg-[#181818]">
              <div className="flex items-center gap-3">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings.store_name}
                    className="w-9 h-9 rounded-xl object-cover border border-[#d99000]/40"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#d99000] flex items-center justify-center text-slate-950 font-black text-base">
                    A
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-white leading-snug">
                    {settings.store_name}
                  </h2>
                  <p className="text-xs text-slate-400">Navegación del Catálogo</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252525] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Navigation */}
            <div className="p-4 border-b border-[#2a2a2a] space-y-1">
              <button
                onClick={() => {
                  onSelectCategory(null);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeCategory === null && !activeSubcategory
                    ? 'bg-[#252525] text-[#d99000] border border-[#d99000]/40 font-semibold'
                    : 'text-slate-300 hover:bg-[#252525] hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-[#d99000]" />
                <span>Todos los Productos</span>
              </button>

              <button
                onClick={() => {
                  onSelectFeaturedOnly();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#252525] hover:text-white transition-all text-left"
              >
                <Star className="w-4 h-4 text-[#d99000] fill-[#d99000]/20" />
                <span>Productos Destacados</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#d99000] bg-[#252525] border border-[#d99000]/40 hover:bg-[#303030] transition-all text-left mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#d99000]" />
                  <span>Panel de Administración</span>
                </button>
              )}

              {user && (
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>

            {/* Categories & Subcategories Accordion */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#d99000]" />
                  Categorías
                </span>
                <span className="text-[10px] text-slate-500">{categories.length} Secciones</span>
              </div>

              {categories.map((cat) => {
                const isActiveCat = activeCategory === cat.id;
                const isExpanded = expandedCategory === cat.id || isActiveCat;
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                return (
                  <div key={cat.id} className="rounded-xl overflow-hidden transition-all bg-[#202020] border border-[#2a2a2a]">
                    <div
                      onClick={() => {
                        onSelectCategory(cat.id);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                        isActiveCat
                          ? 'bg-[#2a2a2a] text-[#d99000] font-semibold'
                          : 'text-slate-300 hover:bg-[#282828]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#d99000]/30"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </div>

                      {hasSubs && (
                        <button
                          onClick={(e) => toggleCategoryExpand(cat.id, e)}
                          className="p-1 text-slate-400 hover:text-white rounded-md"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasSubs && isExpanded && (
                      <div className="pl-11 pr-3 py-1.5 space-y-1 bg-[#141414] border-t border-[#2a2a2a]">
                        {cat.subcategories.map((sub) => {
                          const isSubActive = activeSubcategory === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectSubcategory(cat.id, sub.id);
                                onClose();
                              }}
                              className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-colors block ${
                                isSubActive
                                  ? 'text-[#d99000] font-semibold bg-[#252525]'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#252525]'
                              }`}
                            >
                              • {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Contact Info */}
          <div className="p-4 border-t border-[#2a2a2a] bg-[#181818] space-y-3">
            <div className="text-xs text-slate-400 font-medium">Atención al Cliente</div>
            {settings.whatsapp_number && (
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </a>
            )}
            {settings.secondary_whatsapp && (
              <a
                href={`https://wa.me/${settings.secondary_whatsapp.replace(/[^0-9+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp alternativo: {settings.secondary_whatsapp}</span>
              </a>
            )}
            {settings.contact_email && (
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-[#d99000]" />
                <span>{settings.contact_email}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

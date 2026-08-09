import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockStore } from '../data/mockStore';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = isRegister
        ? mockStore.register({ name, email, password })
        : mockStore.login(email, password);

      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={closeLoginModal}
        className="fixed inset-0 drawer-backdrop transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl p-6 z-10 my-8">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#d99000]/20 border border-[#d99000]/40 flex items-center justify-center text-[#d99000] mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre y apellido"
                className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:border-[#d99000] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl pl-10 pr-3.5 py-2.5 focus:border-[#d99000] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#242424] border border-[#333333] text-slate-100 text-xs rounded-xl pl-10 pr-3.5 py-2.5 focus:border-[#d99000] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#d99000] hover:bg-[#c48200] text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 transition-colors shadow"
          >
            <span>{submitting ? 'Verificando...' : isRegister ? 'Registrar Cuenta' : 'Ingresar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-5 text-center text-xs text-slate-400 border-t border-[#2a2a2a] pt-4">
          {isRegister ? (
            <span>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-[#d99000] hover:underline font-semibold cursor-pointer"
              >
                Inicia Sesión aquí
              </button>
            </span>
          ) : (
            <span>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className="text-[#d99000] hover:underline font-semibold cursor-pointer"
              >
                Regístrate ahora
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

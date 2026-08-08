import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Helper to convert hex color to RGB array
function hexToRgb(hex) {
  if (!hex) return [217, 144, 0];
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return [217, 144, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const ThemeProvider = ({ children, initialSettings }) => {
  const [settings, setSettings] = useState(initialSettings || {
    store_name: 'Aura CyberCatalog',
    logo_url: '',
    primary_color: '#d99000',
    secondary_color: '#181818',
    whatsapp_number: '+573001234567',
    secondary_whatsapp: '+519XXXXXXXX',
    contact_email: 'admin@catalogo.com',
  });

  useEffect(() => {
    if (settings.primary_color) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', settings.primary_color);
      const [r1, g1, b1] = hexToRgb(settings.primary_color);
      root.style.setProperty('--primary-rgb', `${r1}, ${g1}, ${b1}`);
      root.style.setProperty('--primary-glow', `rgba(${r1}, ${g1}, ${b1}, 0.35)`);
    }

    if (settings.secondary_color) {
      const root = document.documentElement;
      root.style.setProperty('--secondary-color', settings.secondary_color);
      const [r2, g2, b2] = hexToRgb(settings.secondary_color);
      root.style.setProperty('--secondary-rgb', `${r2}, ${g2}, ${b2}`);
      root.style.setProperty('--secondary-glow', `rgba(${r2}, ${g2}, ${b2}, 0.3)`);
    }
  }, [settings.primary_color, settings.secondary_color]);

  const updateSettingsState = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ settings, setSettings, updateSettingsState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

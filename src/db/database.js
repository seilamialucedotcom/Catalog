import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Default Seed Data
export const defaultCategories = [
  {
    id: 1,
    name: 'Tecnología & Gadgets',
    slug: 'tecnologia-gadgets',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
    order_index: 1,
  },
  {
    id: 2,
    name: 'Moda Cyberpunk',
    slug: 'moda-cyberpunk',
    image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80',
    order_index: 2,
  },
  {
    id: 3,
    name: 'Hogar Inteligente',
    slug: 'hogar-inteligente',
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&auto=format&fit=crop&q=80',
    order_index: 3,
  },
  {
    id: 4,
    name: 'Audio de Alta Fidelidad',
    slug: 'audio-hi-fi',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    order_index: 4,
  },
  {
    id: 5,
    name: 'Accesorios & Relojes',
    slug: 'accesorios-relojes',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
    order_index: 5,
  },
];

export const defaultSubcategories = [
  { id: 1, category_id: 1, name: 'Smartphones & Tab', slug: 'smartphones-tab' },
  { id: 2, category_id: 1, name: 'Laptops Pro', slug: 'laptops-pro' },
  { id: 3, category_id: 1, name: 'Drones & VR', slug: 'drones-vr' },
  { id: 4, category_id: 2, name: 'Chaquetas LED', slug: 'chaquetas-led' },
  { id: 5, category_id: 2, name: 'Calzado Neón', slug: 'calzado-neon' },
  { id: 6, category_id: 3, name: 'Iluminación RGB', slug: 'iluminacion-rgb' },
  { id: 7, category_id: 3, name: 'Asistentes IA', slug: 'asistentes-ia' },
  { id: 8, category_id: 4, name: 'Auriculares Inalámbricos', slug: 'auriculares' },
  { id: 9, category_id: 4, name: 'Altavoces Studio', slug: 'altavoces' },
  { id: 10, category_id: 5, name: 'Smartwatches', slug: 'smartwatches' },
];

export const defaultProducts = [
  {
    id: 1,
    name: 'Auriculares Quantum Pro RGB',
    slug: 'auriculares-quantum-pro-rgb',
    description: 'Auriculares con cancelación activa de ruido por IA, sonido envolvente 3D espacial y retroiluminación LED sincronizable.',
    price: 189.99,
    category_id: 4,
    subcategory_id: 8,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    is_featured: true,
    stock: 15,
  },
  {
    id: 2,
    name: 'Smartwatch CyberMotion X1',
    slug: 'smartwatch-cybermotion-x1',
    description: 'Reloj inteligente con pantalla AMOLED de 120Hz, sensor biométrico holístico, GPS cuántico y chasis de titanio ultraligero.',
    price: 249.50,
    category_id: 5,
    subcategory_id: 10,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    is_featured: true,
    stock: 8,
  },
  {
    id: 3,
    name: 'Laptop Neon Blade Ultra 16"',
    slug: 'laptop-neon-blade-ultra-16',
    description: 'Procesador de última generación con GPU dedicada para IA y edición 8K. Pantalla OLED táctil ultra brillante.',
    price: 1499.00,
    category_id: 1,
    subcategory_id: 2,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    is_featured: true,
    stock: 5,
  },
  {
    id: 4,
    name: 'Chaqueta Reflectante Neo-Tokyo',
    slug: 'chaqueta-reflectante-neo-tokyo',
    description: 'Chaqueta impermeable con paneles de fibra óptica y tiras reflectantes de alta visibilidad. Estilo urbano futurista.',
    price: 120.00,
    category_id: 2,
    subcategory_id: 4,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    is_featured: false,
    stock: 20,
  },
  {
    id: 5,
    name: 'Lámpara de Ambiente Inteligente RGB',
    slug: 'lampara-ambiente-inteligente-rgb',
    description: 'Lámpara con sincronización de música, control por voz y más de 16 millones de colores personalizables desde la App.',
    price: 65.00,
    category_id: 3,
    subcategory_id: 6,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    is_featured: true,
    stock: 12,
  },
  {
    id: 6,
    name: 'Dron Cinematográfico Aero 4K',
    slug: 'dron-cinematografico-aero-4k',
    description: 'Dron plegable con evitación de obstáculos omnidireccional, transmisión de video de 12 km y cámara Hasselblad 4K.',
    price: 899.99,
    category_id: 1,
    subcategory_id: 3,
    image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80',
    is_featured: false,
    stock: 7,
  },
  {
    id: 7,
    name: 'Zapatillas Bionic Runner Glow',
    slug: 'zapatillas-bionic-runner-glow',
    description: 'Zapatillas deportivas con suela neumática autorregulable y luces LED de baja intensidad en los bordes laterales.',
    price: 135.50,
    category_id: 2,
    subcategory_id: 5,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    is_featured: true,
    stock: 18,
  },
  {
    id: 8,
    name: 'Altavoz de Estudio Hi-Fi Pulse',
    slug: 'altavoz-estudio-hifi-pulse',
    description: 'Altavoz de alta resolución de 120W con conectividad Wi-Fi, Bluetooth 5.3 y chasis acústico antivibraciones.',
    price: 310.00,
    category_id: 4,
    subcategory_id: 9,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    is_featured: false,
    stock: 9,
  }
];

export const defaultSettings = {
  id: 1,
  store_name: 'Comercial Alexis & hnos.',
  logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZAg6Zp2ypzp2hvlZNM_DgdUeJgEvWuPvHg0E4pymHz4s9C6RX6nVYwnXx&s=10',
  primary_color: '#d99000',
  secondary_color: '#181818',
  whatsapp_number: '+51989900564',
  secondary_whatsapp: '+51903009238',

};

// Seed Users
const defaultAdminPasswordHash = bcrypt.hashSync('admin123', 10);
const defaultUserPasswordHash = bcrypt.hashSync('user123', 10);

export const defaultUsers = [
  {
    id: 1,
    name: 'Administrador Principal',
    email: 'admin@catalogo.com',
    password_hash: defaultAdminPasswordHash,
    role: 'admin',
  },
  {
    id: 2,
    name: 'Usuario Cliente',
    email: 'cliente@catalogo.com',
    password_hash: defaultUserPasswordHash,
    role: 'user',
  },
];

// Memory Database Store
class MemoryStore {
  constructor() {
    this.categories = [...defaultCategories];
    this.subcategories = [...defaultSubcategories];
    this.products = [...defaultProducts];
    this.settings = { ...defaultSettings };
    this.users = [...defaultUsers];
    this.nextProductId = 10;
    this.nextCategoryId = 10;
    this.nextSubcategoryId = 20;
    this.nextUserId = 10;
  }

  // Categories
  getCategories() {
    return this.categories.map(cat => ({
      ...cat,
      subcategories: this.subcategories.filter(sub => sub.category_id === cat.id),
    }));
  }

  getCategoryById(id) {
    return this.categories.find(c => c.id === Number(id));
  }

  createCategory(data) {
    const newCat = {
      id: this.nextCategoryId++,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image_url: data.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
      order_index: this.categories.length + 1,
    };
    this.categories.push(newCat);
    return newCat;
  }

  updateCategory(id, data) {
    const catIndex = this.categories.findIndex(c => c.id === Number(id));
    if (catIndex === -1) return null;
    this.categories[catIndex] = {
      ...this.categories[catIndex],
      ...data,
      id: Number(id),
    };
    return this.categories[catIndex];
  }

  deleteCategory(id) {
    const numId = Number(id);
    this.categories = this.categories.filter(c => c.id !== numId);
    this.subcategories = this.subcategories.filter(s => s.category_id !== numId);
    this.products = this.products.map(p => p.category_id === numId ? { ...p, category_id: null, subcategory_id: null } : p);
    return true;
  }

  // Subcategories
  createSubcategory(data) {
    const newSub = {
      id: this.nextSubcategoryId++,
      category_id: Number(data.category_id),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    this.subcategories.push(newSub);
    return newSub;
  }

  deleteSubcategory(id) {
    const numId = Number(id);
    this.subcategories = this.subcategories.filter(s => s.id !== numId);
    this.products = this.products.map(p => p.subcategory_id === numId ? { ...p, subcategory_id: null } : p);
    return true;
  }

  // Products
  getProducts(filters = {}) {
    let result = [...this.products];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (filters.category_id) {
      result = result.filter(p => p.category_id === Number(filters.category_id));
    }

    if (filters.subcategory_id) {
      result = result.filter(p => p.subcategory_id === Number(filters.subcategory_id));
    }

    if (filters.is_featured === 'true' || filters.is_featured === true) {
      result = result.filter(p => p.is_featured);
    }

    if (filters.sort) {
      if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
      else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
      else if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result.map(p => ({
      ...p,
      category_name: this.categories.find(c => c.id === p.category_id)?.name || 'Sin Categoría',
      subcategory_name: this.subcategories.find(s => s.id === p.subcategory_id)?.name || '',
    }));
  }

  getProductById(id) {
    const prod = this.products.find(p => p.id === Number(id));
    if (!prod) return null;
    return {
      ...prod,
      category_name: this.categories.find(c => c.id === prod.category_id)?.name || 'Sin Categoría',
      subcategory_name: this.subcategories.find(s => s.id === prod.subcategory_id)?.name || '',
    };
  }

  createProduct(data) {
    const newProd = {
      id: this.nextProductId++,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      category_id: data.category_id ? Number(data.category_id) : null,
      subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      is_featured: Boolean(data.is_featured),
      stock: parseInt(data.stock, 10) || 10,
    };
    this.products.unshift(newProd);
    return this.getProductById(newProd.id);
  }

  updateProduct(id, data) {
    const index = this.products.findIndex(p => p.id === Number(id));
    if (index === -1) return null;
    this.products[index] = {
      ...this.products[index],
      ...data,
      id: Number(id),
      price: data.price !== undefined ? parseFloat(data.price) : this.products[index].price,
      category_id: data.category_id ? Number(data.category_id) : this.products[index].category_id,
      subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : this.products[index].subcategory_id,
      is_featured: data.is_featured !== undefined ? Boolean(data.is_featured) : this.products[index].is_featured,
      stock: data.stock !== undefined ? parseInt(data.stock, 10) : this.products[index].stock,
    };
    return this.getProductById(id);
  }

  deleteProduct(id) {
    const numId = Number(id);
    this.products = this.products.filter(p => p.id !== numId);
    return true;
  }

  // Settings
  getSettings() {
    return this.settings;
  }

  updateSettings(data) {
    this.settings = {
      ...this.settings,
      ...data,
    };
    return this.settings;
  }

  // Users & Auth
  getUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(data) {
    const newUser = {
      id: this.nextUserId++,
      name: data.name,
      email: data.email.toLowerCase(),
      password_hash: bcrypt.hashSync(data.password, 10),
      role: data.role || 'user',
    };
    this.users.push(newUser);
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  }
}

export const memoryDb = new MemoryStore();

// PostgreSQL Neon Pool Manager
let pool = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log('🔗 Conexión a Neon PostgreSQL configurada vía DATABASE_URL.');
  } catch (err) {
    console.error('⚠️ Error al inicializar Pool de Neon PostgreSQL:', err);
  }
} else {
  console.log('💡 DATABASE_URL no configurada. Utilizando almacenamiento en memoria inicializado con datos demo.');
}

export const isNeonConnected = () => !!process.env.DATABASE_URL;

export async function queryNeon(text, params) {
  if (!pool) throw new Error('Base de datos Neon PostgreSQL no conectada');
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

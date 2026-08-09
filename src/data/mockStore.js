import { mockData } from './mockData';

const STORAGE_KEY = 'catalog_mock_data_v1';

const clone = (value) => JSON.parse(JSON.stringify(value));
const publicUser = ({ password, ...user }) => user;
const makeSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '');

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : clone(mockData);
  } catch {
    return clone(mockData);
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function nextId(items) {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}

function decorateProduct(product, state) {
  return {
    ...product,
    category_name: state.categories.find((category) => category.id === product.category_id)?.name || 'Sin categoría',
    subcategory_name: state.subcategories.find((subcategory) => subcategory.id === product.subcategory_id)?.name || '',
  };
}

export const mockStore = {
  getCatalog() {
    const state = readState();
    return {
      settings: clone(state.settings),
      categories: state.categories
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((category) => ({
          ...category,
          subcategories: state.subcategories.filter((subcategory) => subcategory.category_id === category.id),
        })),
    };
  },

  getProducts(filters = {}) {
    const state = readState();
    let products = state.products.slice();
    const query = filters.search?.trim().toLowerCase();
    if (query) products = products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(query));
    if (filters.category_id !== null && filters.category_id !== undefined) products = products.filter((product) => product.category_id === Number(filters.category_id));
    if (filters.subcategory_id !== null && filters.subcategory_id !== undefined) products = products.filter((product) => product.subcategory_id === Number(filters.subcategory_id));
    if (filters.is_featured) products = products.filter((product) => product.is_featured);
    return products.map((product) => decorateProduct(product, state));
  },

  login(email, password) {
    const user = readState().users.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password);
    if (!user) throw new Error('Credenciales inválidas. Usa admin@catalogo.com / admin123 para probar el panel.');
    return { user: publicUser(user), token: `mock-session-${user.id}` };
  },

  register({ name, email, password }) {
    const state = readState();
    if (state.users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) throw new Error('El correo electrónico ya está registrado.');
    const user = { id: nextId(state.users), name: name.trim(), email: email.trim().toLowerCase(), password, role: 'user' };
    state.users.push(user);
    writeState(state);
    return { user: publicUser(user), token: `mock-session-${user.id}` };
  },

  getSession(token) {
    const id = Number(String(token || '').replace('mock-session-', ''));
    const user = readState().users.find((candidate) => candidate.id === id);
    return user ? publicUser(user) : null;
  },

  saveProduct(data, id) {
    const state = readState();
    const product = { ...data, name: data.name.trim(), slug: makeSlug(data.name), price: Number(data.price), category_id: Number(data.category_id), subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null, is_featured: Boolean(data.is_featured), stock: Number(data.stock) || 10 };
    if (id) {
      const index = state.products.findIndex((item) => item.id === Number(id));
      if (index === -1) throw new Error('Producto no encontrado.');
      state.products[index] = { ...state.products[index], ...product, id: Number(id) };
      writeState(state);
      return decorateProduct(state.products[index], state);
    }
    const newProduct = { ...product, id: nextId(state.products) };
    state.products.unshift(newProduct);
    writeState(state);
    return decorateProduct(newProduct, state);
  },

  deleteProduct(id) {
    const state = readState();
    state.products = state.products.filter((product) => product.id !== Number(id));
    writeState(state);
  },

  saveCategory(data, id) {
    const state = readState();
    const category = { name: data.name.trim(), slug: makeSlug(data.name), image_url: data.image_url };
    if (id) {
      const index = state.categories.findIndex((item) => item.id === Number(id));
      if (index === -1) throw new Error('Categoría no encontrada.');
      state.categories[index] = { ...state.categories[index], ...category };
      writeState(state);
      return state.categories[index];
    }
    const newCategory = { ...category, id: nextId(state.categories), order_index: state.categories.length + 1 };
    state.categories.push(newCategory);
    writeState(state);
    return newCategory;
  },

  deleteCategory(id) {
    const state = readState();
    const categoryId = Number(id);
    const removedSubcategoryIds = state.subcategories.filter((subcategory) => subcategory.category_id === categoryId).map((subcategory) => subcategory.id);
    state.categories = state.categories.filter((category) => category.id !== categoryId);
    state.subcategories = state.subcategories.filter((subcategory) => subcategory.category_id !== categoryId);
    state.products = state.products.map((product) => removedSubcategoryIds.includes(product.subcategory_id) || product.category_id === categoryId ? { ...product, category_id: null, subcategory_id: null } : product);
    writeState(state);
  },

  addSubcategory({ category_id, name }) {
    const state = readState();
    const subcategory = { id: nextId(state.subcategories), category_id: Number(category_id), name: name.trim(), slug: makeSlug(name) };
    state.subcategories.push(subcategory);
    writeState(state);
    return subcategory;
  },

  deleteSubcategory(id) {
    const state = readState();
    const subcategoryId = Number(id);
    state.subcategories = state.subcategories.filter((subcategory) => subcategory.id !== subcategoryId);
    state.products = state.products.map((product) => product.subcategory_id === subcategoryId ? { ...product, subcategory_id: null } : product);
    writeState(state);
  },

  saveSettings(settings) {
    const state = readState();
    state.settings = { ...state.settings, ...settings };
    writeState(state);
    return clone(state.settings);
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

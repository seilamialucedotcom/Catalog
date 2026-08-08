import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  memoryDb,
  isNeonConnected,
  queryNeon,
  defaultCategories,
  defaultProducts,
  defaultSettings,
} from './src/db/database.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'catalogo-inteligente-jwt-secret-key-2026';

app.use(express.json());

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

// Authentication Middleware
const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }
      req.user = decoded as AuthenticatedRequest['user'];
      next();
    });
  } else {
    res.status(401).json({ error: 'No autorizado: Token de acceso requerido' });
  }
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador' });
  }
};

// ==========================================
// PUBLIC CATALOG ENDPOINTS
// ==========================================

// Initial Catalog Initialization payload
app.get('/api/catalog/init', async (req: Request, res: Response) => {
  try {
    if (isNeonConnected()) {
      try {
        const settingsRes = await queryNeon('SELECT * FROM catalog_settings LIMIT 1', []);
        const categoriesRes = await queryNeon('SELECT * FROM categories ORDER BY order_index ASC', []);
        const subcategoriesRes = await queryNeon('SELECT * FROM subcategories ORDER BY name ASC', []);
        const featuredRes = await queryNeon('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true ORDER BY p.created_at DESC', []);

        const categoriesWithSubs = categoriesRes.rows.map(cat => ({
          ...cat,
          subcategories: subcategoriesRes.rows.filter(sub => sub.category_id === cat.id),
        }));

        return res.json({
          settings: settingsRes.rows[0] || defaultSettings,
          categories: categoriesWithSubs,
          featured_products: featuredRes.rows,
          neon_connected: true,
        });
      } catch (neonErr) {
        console.warn('Fallback a almacenamiento local por consulta en Neon:', neonErr);
      }
    }

    // Memory Store Fallback
    res.json({
      settings: memoryDb.getSettings(),
      categories: memoryDb.getCategories(),
      featured_products: memoryDb.getProducts({ is_featured: true }),
      neon_connected: false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la configuración inicial del catálogo' });
  }
});

// Products Listing with Search and Filters
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { search, category_id, subcategory_id, is_featured, sort } = req.query;

    if (isNeonConnected()) {
      try {
        let sql = `
          SELECT p.*, c.name as category_name, s.name as subcategory_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN subcategories s ON p.subcategory_id = s.id
          WHERE 1=1
        `;
        const params: any[] = [];

        if (search) {
          params.push(`%${search}%`);
          sql += ` AND (LOWER(p.name) LIKE LOWER($${params.length}) OR LOWER(p.description) LIKE LOWER($${params.length}))`;
        }

        if (category_id) {
          params.push(Number(category_id));
          sql += ` AND p.category_id = $${params.length}`;
        }

        if (subcategory_id) {
          params.push(Number(subcategory_id));
          sql += ` AND p.subcategory_id = $${params.length}`;
        }

        if (is_featured === 'true') {
          sql += ` AND p.is_featured = true`;
        }

        if (sort === 'price-asc') sql += ` ORDER BY p.price ASC`;
        else if (sort === 'price-desc') sql += ` ORDER BY p.price DESC`;
        else if (sort === 'name') sql += ` ORDER BY p.name ASC`;
        else sql += ` ORDER BY p.created_at DESC`;

        const result = await queryNeon(sql, params);
        return res.json(result.rows);
      } catch (err) {
        console.warn('Fallback a memoria por error en Neon SQL:', err);
      }
    }

    const products = memoryDb.getProducts({ search, category_id, subcategory_id, is_featured, sort });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isNeonConnected()) {
      try {
        const sql = `
          SELECT p.*, c.name as category_name, s.name as subcategory_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN subcategories s ON p.subcategory_id = s.id
          WHERE p.id = $1
        `;
        const result = await queryNeon(sql, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        return res.json(result.rows[0]);
      } catch (err) {
        console.warn('Neon error:', err);
      }
    }

    const product = memoryDb.getProductById(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalles del producto' });
  }
});

// Get Categories & Subcategories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    if (isNeonConnected()) {
      try {
        const catRes = await queryNeon('SELECT * FROM categories ORDER BY order_index ASC', []);
        const subRes = await queryNeon('SELECT * FROM subcategories ORDER BY name ASC', []);

        const categories = catRes.rows.map(cat => ({
          ...cat,
          subcategories: subRes.rows.filter(sub => sub.category_id === cat.id),
        }));

        return res.json(categories);
      } catch (err) {
        console.warn('Neon categories error:', err);
      }
    }

    res.json(memoryDb.getCategories());
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// User / Admin Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo electrónico y contraseña requeridos' });
    }

    let user = null;

    if (isNeonConnected()) {
      try {
        const userRes = await queryNeon(`
          SELECT u.id, u.name, u.email, u.password_hash, r.name as role
          FROM users u
          JOIN roles r ON u.role_id = r.id
          WHERE LOWER(u.email) = LOWER($1)
        `, [email]);

        if (userRes.rows.length > 0) {
          user = userRes.rows[0];
        }
      } catch (err) {
        console.warn('Neon Auth query fallback to MemoryStore:', err);
      }
    }

    if (!user) {
      user = memoryDb.getUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});

// User Registration
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existingUser = memoryDb.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const newUser = memoryDb.createUser({ name, email, password, role: 'user' });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// ==========================================
// PROTECTED ADMIN ENDPOINTS
// ==========================================

// Create Product
app.post('/api/admin/products', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.price) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }

    if (isNeonConnected()) {
      try {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sql = `
          INSERT INTO products (name, slug, description, price, category_id, subcategory_id, image_url, is_featured, stock)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const result = await queryNeon(sql, [
          data.name,
          slug,
          data.description || '',
          parseFloat(data.price),
          data.category_id ? Number(data.category_id) : null,
          data.subcategory_id ? Number(data.subcategory_id) : null,
          data.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          Boolean(data.is_featured),
          parseInt(data.stock, 10) || 10,
        ]);
        return res.status(201).json(result.rows[0]);
      } catch (err) {
        console.warn('Neon product insert error:', err);
      }
    }

    const newProduct = memoryDb.createProduct(data);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Update Product
app.put('/api/admin/products/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (isNeonConnected()) {
      try {
        const sql = `
          UPDATE products
          SET name = $1, description = $2, price = $3, category_id = $4, subcategory_id = $5, image_url = $6, is_featured = $7, stock = $8
          WHERE id = $9
          RETURNING *
        `;
        const result = await queryNeon(sql, [
          data.name,
          data.description || '',
          parseFloat(data.price),
          data.category_id ? Number(data.category_id) : null,
          data.subcategory_id ? Number(data.subcategory_id) : null,
          data.image_url,
          Boolean(data.is_featured),
          parseInt(data.stock, 10) || 0,
          id,
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        return res.json(result.rows[0]);
      } catch (err) {
        console.warn('Neon product update error:', err);
      }
    }

    const updated = memoryDb.updateProduct(id, data);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Delete Product
app.delete('/api/admin/products/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isNeonConnected()) {
      try {
        await queryNeon('DELETE FROM products WHERE id = $1', [id]);
        return res.json({ success: true, message: 'Producto eliminado' });
      } catch (err) {
        console.warn('Neon delete product error:', err);
      }
    }

    memoryDb.deleteProduct(id);
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Create Category
app.post('/api/admin/categories', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });

    if (isNeonConnected()) {
      try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const result = await queryNeon(`
          INSERT INTO categories (name, slug, image_url)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [name, slug, image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80']);
        return res.status(201).json(result.rows[0]);
      } catch (err) {
        console.warn('Neon category insert error:', err);
      }
    }

    const newCat = memoryDb.createCategory(req.body);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Update Category
app.put('/api/admin/categories/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, image_url } = req.body;

    if (isNeonConnected()) {
      try {
        const result = await queryNeon(`
          UPDATE categories
          SET name = $1, image_url = $2
          WHERE id = $3
          RETURNING *
        `, [name, image_url, id]);
        return res.json(result.rows[0]);
      } catch (err) {
        console.warn('Neon category update error:', err);
      }
    }

    const updated = memoryDb.updateCategory(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// Delete Category
app.delete('/api/admin/categories/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (isNeonConnected()) {
      try {
        await queryNeon('DELETE FROM categories WHERE id = $1', [id]);
        return res.json({ success: true, message: 'Categoría eliminada' });
      } catch (err) {
        console.warn('Neon category delete error:', err);
      }
    }

    memoryDb.deleteCategory(id);
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// Create Subcategory
app.post('/api/admin/subcategories', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category_id, name } = req.body;
    if (!category_id || !name) return res.status(400).json({ error: 'Categoría y nombre son obligatorios' });

    if (isNeonConnected()) {
      try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const result = await queryNeon(`
          INSERT INTO subcategories (category_id, name, slug)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [category_id, name, slug]);
        return res.status(201).json(result.rows[0]);
      } catch (err) {
        console.warn('Neon subcategory insert error:', err);
      }
    }

    const newSub = memoryDb.createSubcategory(req.body);
    res.status(201).json(newSub);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear subcategoría' });
  }
});

// Delete Subcategory
app.delete('/api/admin/subcategories/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (isNeonConnected()) {
      try {
        await queryNeon('DELETE FROM subcategories WHERE id = $1', [id]);
        return res.json({ success: true, message: 'Subcategoría eliminada' });
      } catch (err) {
        console.warn('Neon delete subcategory error:', err);
      }
    }

    memoryDb.deleteSubcategory(id);
    res.json({ success: true, message: 'Subcategoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
});

// Get Settings for Admin
app.get('/api/admin/settings', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (isNeonConnected()) {
      try {
        const result = await queryNeon('SELECT * FROM catalog_settings LIMIT 1', []);
        return res.json(result.rows[0] || defaultSettings);
      } catch (err) {
        console.warn('Neon get settings error:', err);
      }
    }

    res.json(memoryDb.getSettings());
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
});

// Update Store Settings
app.put('/api/admin/settings', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    if (isNeonConnected()) {
      try {
        const result = await queryNeon(`
          UPDATE catalog_settings
          SET store_name = $1, logo_url = $2, primary_color = $3, secondary_color = $4, whatsapp_number = $5, secondary_whatsapp = $6, contact_email = $7, updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
          RETURNING *
        `, [
          data.store_name,
          data.logo_url,
          data.primary_color,
          data.secondary_color,
          data.whatsapp_number,
          data.secondary_whatsapp,
          data.contact_email,
        ]);
        return res.json(result.rows[0]);
      } catch (err) {
        console.warn('Neon settings update error:', err);
      }
    }

    const updated = memoryDb.updateSettings(data);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar configuraciones del catálogo' });
  }
});

// SQL Schema Export View Endpoint
app.get('/api/admin/db-schema', (req: Request, res: Response) => {
  try {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
      return res.json({ schema: sqlContent });
    }
    res.status(404).json({ error: 'Archivo de esquema no encontrado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo de esquema SQL' });
  }
});

// Database Test Connection Endpoint
app.post('/api/admin/db-test', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { connection_string } = req.body;
  const connStr = connection_string || process.env.DATABASE_URL;

  if (!connStr) {
    return res.status(400).json({
      connected: false,
      message: 'No se ha configurado DATABASE_URL en el entorno ni se envió cadena de conexión.',
    });
  }

  try {
    const tempPool = new (require('pg').Pool)({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
    });
    const client = await tempPool.connect();
    const result = await client.query('SELECT NOW() as server_time, current_database() as db_name, version()');
    client.release();
    tempPool.end();

    res.json({
      connected: true,
      message: 'Conexión a Neon PostgreSQL establecida exitosamente.',
      details: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      connected: false,
      message: `Error al conectar a Neon PostgreSQL: ${err.message}`,
    });
  }
});

// ==========================================
// VITE MIDDLEWARE & SERVER INITIALIZATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();

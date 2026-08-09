# Catálogo Digital — Solo frontend

La aplicación funciona completamente en el navegador: no usa Express, Node como servidor, APIs, Neon ni variables de entorno.

## Ejecutar

1. Instala las dependencias: `npm install`.
2. Inicia Vite: `npm run dev`.
3. Abre la URL mostrada por Vite.

Para generar el sitio estático usa `npm run build`. Puede desplegarse en Vercel como proyecto Vite estático; no se configura ninguna Serverless Function.

## Datos locales

- [`src/data/mockData.js`](src/data/mockData.js) contiene los productos, categorías, subcategorías, usuarios de demostración y configuración inicial.
- [`src/data/mockStore.js`](src/data/mockStore.js) implementa búsqueda, login, registro y CRUD del panel de administración mediante `localStorage`.
- Los cambios sobreviven una recarga en el mismo navegador. Para restaurar los datos iniciales, elimina la clave `catalog_mock_data_v1` desde las herramientas de desarrollo del navegador.

Credenciales de prueba:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@catalogo.com` | `admin123` |
| Cliente | `cliente@catalogo.com` | `user123` |

Estas credenciales y datos son solo simulados; no ofrecen seguridad ni sincronización entre dispositivos.

<<<<<<< HEAD
Catálogo Digital
=======
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Catálogo

## Desarrollo local

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env.local` y configura las variables necesarias.
3. Ejecuta `npm run dev`. El servidor local expone el frontend y la API en el mismo origen.

## Despliegue en Vercel

El archivo `api/[...path].ts` convierte Express en una única Vercel Function. No se debe ejecutar `app.listen()` dentro de Vercel: la plataforma importa el handler y administra el servidor HTTP. `vercel.json` conserva las rutas `/api/*` para esa función y reescribe las demás rutas a `index.html` para soportar la SPA.

En Vercel, configura estas variables de entorno para Production, Preview y Development según corresponda:

| Variable | Requerida | Uso |
| --- | --- | --- |
| `JWT_SECRET` | Sí | Valor largo, aleatorio y estable. Si cambia, invalida todas las sesiones. |
| `DATABASE_URL` | No | URL de PostgreSQL/Neon para datos persistentes. |
| `GEMINI_API_KEY` | Solo si se usa Gemini | Credencial de Gemini. |

Después de definirlas, haz un nuevo despliegue. Comprueba `https://tu-dominio.vercel.app/api/catalog/init`: debe responder con `Content-Type: application/json`, nunca con una página HTML.

## Base de datos en memoria y serverless

Sin `DATABASE_URL`, la API inicia `memoryDb` con los datos demo en cada instancia de función. Es útil para una demostración, pero no es una base de datos persistente: los cambios de productos, categorías, ajustes y registros pueden desaparecer en un cold start, y distintas instancias pueden ver estados distintos. No debe usarse para datos reales.

Para persistencia en producción:

1. Crea una base Neon/PostgreSQL y ejecuta [`schema.sql`](schema.sql).
2. Define `DATABASE_URL` en Vercel usando la cadena SSL del proveedor.
3. Define un `JWT_SECRET` nuevo y estable; no uses el valor de ejemplo ni el fallback del código.
4. Vuelve a desplegar y verifica el endpoint de catálogo. Las rutas de catálogo y administración usarán Neon; si la conexión falla, la API seguirá respondiendo con los datos demo en memoria.

El cliente valida `Content-Type` antes de analizar respuestas como JSON. Si Vercel, un proxy o una ruta inexistente devuelve HTML, se mostrará un mensaje de despliegue claro en lugar del error `Unexpected token`.
>>>>>>> 9449c2d (dos)

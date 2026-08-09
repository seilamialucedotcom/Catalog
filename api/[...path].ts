import app from '../server';

// A single catch-all Vercel Function keeps the existing Express API routes
// available at /api/* without starting a standalone HTTP server.
export default app;

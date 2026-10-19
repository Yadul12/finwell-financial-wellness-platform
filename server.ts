import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter, actuatorRouter } from './server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parser
  app.use(express.json());

  // Structured Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        userAgent: req.headers['user-agent'] || 'unknown',
      };
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/actuator')) {
        console.log(`[API LOG] ${log.method} ${log.path} ${log.status} - ${log.durationMs}ms`);
      }
    });
    next();
  });

  // Mount API & Actuator routes
  app.use('/api', apiRouter);
  app.use('/actuator', actuatorRouter);

  // Mount Vite or serve static production build
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Finwell Server] Running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Finwell Server] Fatal startup error:', err);
  process.exit(1);
});

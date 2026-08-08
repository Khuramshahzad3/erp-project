import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';


console.log('📡 ERP Backend initialized successfully in Serverless Mode');
connectDatabase();

if (!process.env.VERCEL) {
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running in production-mode on port ${env.PORT}`);
  });

  process.on('unhandledRejection', (err: any) => {
    console.error('💥 Unhandled Rejection! Shutting down server...');
    console.error(err);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('uncaughtException', (err: any) => {
    console.error('💥 Uncaught Exception! Shutting down server...');
    console.error(err);
    process.exit(1);
  });
}

export default app;

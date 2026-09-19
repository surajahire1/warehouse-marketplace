import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
  });

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down HTTP server gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();

import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import prisma from './prisma.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌻 Sunflower Animation API running on http://localhost:${PORT}`);
  console.log(`🌱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌻 API routes:   http://localhost:${PORT}/api/sunflowers`);
  console.log(`======================================================\n`);
});

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Gracefully terminating sunflower server...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Prisma SQLite connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

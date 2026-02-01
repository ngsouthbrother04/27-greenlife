import 'dotenv/config';
import app from './app.js';
import prisma from './utils/db.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err);
      server.close(() => {
        // Ensure DB connection is closed
        prisma.$disconnect();
        process.exit(1);
      });
    });

    // Handle SIGTERM/SIGINT
    const gracefulShutdown = async () => {
      console.log('👋 Received kill signal, shutting down gracefully');
      server.close(async () => {
        console.log('Closed out remaining connections');
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();

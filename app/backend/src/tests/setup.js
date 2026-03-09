// Setup db connection mock or reset logic for backend tests here
// For API tests, we might want to clear database before each test
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// This will run before each test file
beforeAll(async () => {
  // Optionally connect to a test database here
});

afterAll(async () => {
  await prisma.$disconnect();
});

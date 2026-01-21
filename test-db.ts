
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing DB connection...");
    const count = await prisma.user.count();
    console.log("DB Connection successful! User count:", count);
  } catch (error) {
    console.error("DB Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

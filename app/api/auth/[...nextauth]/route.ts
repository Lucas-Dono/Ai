import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

// IMPORTANT: Force Node.js runtime because NextAuth callbacks use Prisma
// which cannot run on Edge Runtime without Prisma Accelerate or Driver Adapters
export const runtime = 'nodejs';

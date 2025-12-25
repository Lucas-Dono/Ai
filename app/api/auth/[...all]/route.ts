import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// Force Node.js runtime because auth uses Prisma
export const runtime = 'nodejs';

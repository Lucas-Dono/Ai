import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const kind = searchParams.get("kind");
  const featured = searchParams.get("featured") === "true";
  const sort = searchParams.get("sort") || "popular";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const where: any = { visibility: "public" };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }
  if (kind) where.kind = kind;
  if (featured) where.featured = true;

  const orderBy: any = sort === "popular" ? { cloneCount: "desc" } :
                       sort === "rating" ? { rating: "desc" } :
                       { createdAt: "desc" };

  const agents = await prisma.agent.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true, clones: true } },
    },
  });

  return NextResponse.json({ agents, total: agents.length });
}

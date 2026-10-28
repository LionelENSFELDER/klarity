import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Export RGPD : tout ce que Klarity stocke pour le compte, en JSON.
// Le middleware ne couvre pas /api : la session est vérifiée ici.
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      createdAt: true,
      contracts: { omit: { userId: true } },
      categories: { omit: { userId: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify({ exportedAt: new Date(), ...user }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="klarity-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

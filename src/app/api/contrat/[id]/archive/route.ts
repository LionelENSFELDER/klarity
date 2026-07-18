import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/contracts/[id]/archive - Archiver/désarchiver un contrat
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { archived } = body;

    const existingContract = await prisma.contract.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: "Contrat non trouvé" },
        { status: 404 },
      );
    }

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        status: archived ? "archived" : "active",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erreur lors de l'archivage du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

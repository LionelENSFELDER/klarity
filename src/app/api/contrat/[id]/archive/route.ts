import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/contracts/[id]/archive - Archiver/désarchiver un contrat
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { archived } = body;

    const existingContract = await prisma.contract.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: archived ? "ARCHIVED" : "ACTIVE",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erreur lors de l'archivage du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

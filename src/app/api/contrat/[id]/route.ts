import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contracts/[id] - Récupérer un contrat spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const contract = await prisma.contract.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erreur lors de la récupération du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id] - Modifier un contrat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, value, status } = body;

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
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        value: value ? parseFloat(value) : null,
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erreur lors de la modification du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[id] - Supprimer un contrat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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

    await prisma.contract.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Contrat supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
